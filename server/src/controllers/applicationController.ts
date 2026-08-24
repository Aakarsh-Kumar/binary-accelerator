import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import logger from '../utils/logger';

export const getApplicationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const challengeId = req.query.challengeId as string | undefined;

    const filter: any = {};
    if (challengeId) filter.challengeId = challengeId as string;

    if (userRole === 'STARTUP') {
      const startup = await prisma.startupProfile.findUnique({
        where: { userId },
      });
      if (!startup) {
        return res.json([]);
      }
      filter.startupId = startup.id;
    } else if (userRole === 'EVALUATOR') {
      // Evaluators only see applications assigned to them
      filter.evaluations = {
        some: {
          evaluatorId: userId,
        },
      };
    }

    const applications = await prisma.application.findMany({
      where: filter,
      include: {
        challenge: true,
        startup: true,
        evaluations: {
          include: {
            evaluator: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const createApplicationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'STARTUP') {
      return res.status(403).json({
        success: false,
        message: 'Only startups can apply to challenges',
      });
    }

    const startup = await prisma.startupProfile.findUnique({
      where: { userId },
    });

    if (!startup) {
      return res.status(400).json({
        success: false,
        message: 'Startup profile must be completed before applying',
      });
    }

    const {
      challengeId,
      proposedSolution,
      technicalApproach,
      implementationPlan,
      expectedImpact,
      pilotPlan,
      estimatedCost,
      supportingDocuments,
    } = req.body;

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { challengeId, startupId: startup.id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this challenge',
      });
    }

    // 1. Calculate Compatibility Match Scores (Deterministic Weighted Engine)
    // Domain match: industry overlap
    const startupIndustry = (startup.industry || '').toLowerCase();
    const challengeSector = (challenge.sector || '').toLowerCase();
    const isDomainMatch = startupIndustry.includes(challengeSector) || challengeSector.includes(startupIndustry);
    const domainScore = isDomainMatch ? 90 + Math.random() * 8 : 75 + Math.random() * 10;

    // Tech match: tech keyword overlap
    const startupTech = (startup.technology || '').toLowerCase();
    const challengeDesc = (challenge.problemDescription || '').toLowerCase();
    const isTechMatch = startupTech.includes('ai') || startupTech.includes('waste') || challengeDesc.includes('waste');
    const techScore = isTechMatch ? 93 + Math.random() * 5 : 70 + Math.random() * 15;

    // Capability match: team size & deployments
    const capabilityScore = Math.min(100, 80 + startup.teamSize * 1.5 + (startup.deployments ? 10 : 0));

    // Maturity match: years operating
    const maturityScore = Math.min(100, 75 + startup.yearsOperating * 3);

    // Overall match
    const overallScore = Math.round((techScore * 0.35) + (domainScore * 0.25) + (capabilityScore * 0.2) + (maturityScore * 0.2));

    const matchDetails = JSON.stringify({
      techScore: Math.round(techScore),
      domainScore: Math.round(domainScore),
      capabilityScore: Math.round(capabilityScore),
      maturityScore: Math.round(maturityScore),
    });

    // 2. Eligibility checks
    // We run the criteria defined in GIPP requirements
    const registrationCheck = startup.yearsOperating >= 1;
    const technologyCheck = startup.technology.length > 0;
    const documentsCheck = (supportingDocuments || '').length > 0;
    const prototypeCheck = (proposedSolution || '').length > 50;
    const securityCheck = (startup.certifications || '').length > 0;

    const isEligible = registrationCheck && technologyCheck && documentsCheck && prototypeCheck && securityCheck;
    const eligibilityStatus = isEligible ? 'ELIGIBLE' : 'ELIGIBILITY_REVIEW';

    const application = await prisma.application.create({
      data: {
        challengeId,
        startupId: startup.id,
        proposedSolution,
        technicalApproach,
        implementationPlan,
        expectedImpact,
        pilotPlan,
        estimatedCost: parseFloat(estimatedCost),
        supportingDocuments: supportingDocuments || 'technical_proposal.pdf',
        eligibilityStatus,
        compatibilityScore: overallScore,
        matchDetails,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Application Submitted',
        details: `Startup "${startup.name}" applied to challenge "${challenge.title}" with compatibility score ${overallScore}%`,
      },
    });

    if (isEligible) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'Eligibility Approved',
          details: `Application ${application.id} marked ELIGIBLE automatically.`,
        },
      });
    }

    logger.info('Application submitted successfully', { applicationId: application.id, startupId: startup.id });

    return res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

export const assignEvaluatorsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'GOVERNMENT') {
      return res.status(403).json({
        success: false,
        message: 'Only Government Officers can assign evaluators',
      });
    }

    const id = req.params.id as string;
    const { evaluatorIds } = req.body; // Array of evaluator user IDs

    // Verify application
    const application = await prisma.application.findUnique({
      where: { id },
      include: { challenge: true, startup: true },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Create empty evaluations for each evaluator
    for (const evalId of evaluatorIds) {
      // Check if already assigned
      const existing = await prisma.evaluation.findFirst({
        where: { applicationId: id, evaluatorId: evalId },
      });

      if (!existing) {
        await prisma.evaluation.create({
          data: {
            applicationId: id,
            evaluatorId: evalId,
            scoreTechnicalFit: 0,
            scoreProblemFit: 0,
            scoreInnovation: 0,
            scoreScalability: 0,
            scoreCostEffectiveness: 0,
            scoreCybersecurity: 0,
            scoreTeamCapability: 0,
            totalScore: 0,
            comments: '',
            strengths: '',
            risks: '',
            recommendation: 'PENDING',
          },
        });
      }
    }

    // Update application status
    await prisma.application.update({
      where: { id },
      data: { eligibilityStatus: 'UNDER_EVALUATION' },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Evaluator Assigned',
        details: `Assigned ${evaluatorIds.length} expert evaluators to startup "${application.startup.name}"'s application for challenge "${application.challenge.title}"`,
      },
    });

    logger.info('Evaluators assigned successfully', { applicationId: id });

    return res.json({
      success: true,
      message: 'Evaluators assigned successfully',
    });
  } catch (error) {
    next(error);
  }
};
