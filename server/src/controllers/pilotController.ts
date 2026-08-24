import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import logger from '../utils/logger';

export const getPilotsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    let filter: any = {};

    if (userRole === 'STARTUP') {
      const startup = await prisma.startupProfile.findUnique({
        where: { userId },
      });
      if (!startup) {
        return res.json([]);
      }
      filter.startupId = startup.id;
    }

    const pilots = await prisma.pilot.findMany({
      where: filter,
      include: {
        challenge: true,
        startup: true,
        kpis: true,
        milestones: true,
        validations: true,
        passports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(pilots);
  } catch (error) {
    next(error);
  }
};

export const createPilotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'GOVERNMENT') {
      return res.status(403).json({
        success: false,
        message: 'Only Government Officers can initialize pilots',
      });
    }

    const {
      applicationId,
      startDate,
      endDate,
      location,
      budget,
      objectives,
      kpis,
      milestones,
    } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        challenge: true,
        startup: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Update application status to SELECTED
    await prisma.application.update({
      where: { id: applicationId },
      data: { eligibilityStatus: 'SELECTED' },
    });

    // Create Pilot
    const pilot = await prisma.pilot.create({
      data: {
        startupId: application.startupId,
        challengeId: application.challengeId,
        applicationId: application.id,
        location: location || application.challenge.location,
        startDate,
        endDate,
        budget: parseFloat(budget) || application.challenge.budget,
        objectives: objectives || application.proposedSolution,
        status: 'ACTIVE',
      },
    });

    // Seed KPIs for this pilot
    if (kpis && kpis.length > 0) {
      for (const kpi of kpis) {
        await prisma.pilotKpi.create({
          data: {
            pilotId: pilot.id,
            name: kpi.name,
            unit: kpi.unit,
            baseline: kpi.baseline,
            target: kpi.target,
            minimum: kpi.minimum,
            currentValue: kpi.baseline,
            status: 'IN_PROGRESS',
          },
        });
      }
    } else {
      // Default GIPP Showcase KPI
      await prisma.pilotKpi.create({
        data: {
          pilotId: pilot.id,
          name: 'Waste Collection Efficiency',
          unit: '%',
          baseline: '65',
          target: '85',
          minimum: '80',
          currentValue: '65',
          status: 'IN_PROGRESS',
        },
      });
    }

    // Seed Milestones for this pilot
    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        await prisma.pilotMilestone.create({
          data: {
            pilotId: pilot.id,
            name: m.name,
            description: m.description,
            deadline: m.deadline,
            deliverable: m.deliverable,
            paymentAmount: parseFloat(m.paymentAmount),
            status: 'PENDING',
            paymentStatus: 'PENDING',
          },
        });
      }
    } else {
      // Default Milestones
      const defaultM = [
        { name: 'M1 — Prototype Deployment', desc: 'Deploy Waste AI models to municipal sites', amount: 200000 },
        { name: 'M2 — Mid-Pilot Evaluation', desc: 'Review collection analytics and system performance', amount: 300000 },
        { name: 'M3 — Target Achievement', desc: 'Verify waste collection rates cross the 85% threshold', amount: 400000 },
        { name: 'M4 — Final Validation', desc: 'Compile independent validation logs and audit outputs', amount: 100000 },
      ];

      for (const m of defaultM) {
        await prisma.pilotMilestone.create({
          data: {
            pilotId: pilot.id,
            name: m.name,
            description: m.desc,
            deadline: '30 Days',
            deliverable: 'Deployment Reports & Metrics Logs',
            paymentAmount: m.amount,
            status: 'PENDING',
            paymentStatus: 'PENDING',
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Pilot Created',
        details: `Pilot project initialized for startup "${application.startup.name}" on challenge "${application.challenge.title}"`,
      },
    });

    logger.info('Pilot initialized successfully', { pilotId: pilot.id });

    const fullPilot = await prisma.pilot.findUnique({
      where: { id: pilot.id },
      include: { kpis: true, milestones: true },
    });

    return res.status(201).json(fullPilot);
  } catch (error) {
    next(error);
  }
};

export const getPilotDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const pilot = await prisma.pilot.findUnique({
      where: { id },
      include: {
        challenge: true,
        startup: true,
        kpis: true,
        milestones: true,
        validations: true,
        passports: true,
      },
    });

    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found',
      });
    }

    return res.json(pilot);
  } catch (error) {
    next(error);
  }
};

export const updatePilotKpiController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const id = req.params.id as string;
    const kpiId = req.params.kpiId as string;
    const { currentValue, evidenceUrl } = req.body;

    const kpi = await prisma.pilotKpi.findUnique({
      where: { id: kpiId },
    });

    if (!kpi) {
      return res.status(404).json({
        success: false,
        message: 'KPI not found',
      });
    }

    // Determine status
    const targetVal = parseFloat(kpi.target) || 0;
    const currentValNum = parseFloat(currentValue) || 0;
    const status = currentValNum >= targetVal ? 'TARGET_ACHIEVED' : 'IN_PROGRESS';

    await prisma.pilotKpi.update({
      where: { id: kpiId },
      data: {
        currentValue,
        evidenceUrl: evidenceUrl || 'metrics_log_report.csv',
        status,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Evidence Uploaded',
        details: `Updated KPI "${kpi.name}" value to ${currentValue} (target ${kpi.target}) with evidence file.`,
      },
    });

    return res.json({
      success: true,
      message: 'KPI updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePilotMilestoneController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const id = req.params.id as string;
    const milestoneId = req.params.milestoneId as string;
    const { evidenceUrl } = req.body;

    const milestone = await prisma.pilotMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    await prisma.pilotMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'SUBMITTED',
        evidenceUrl: evidenceUrl || 'milestone_verification_doc.pdf',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Evidence Uploaded',
        details: `Uploaded deliverable evidence for milestone "${milestone.name}"`,
      },
    });

    return res.json({
      success: true,
      message: 'Milestone evidence uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const approvePilotMilestoneController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'GOVERNMENT') {
      return res.status(403).json({
        success: false,
        message: 'Only Government Officers can approve milestones',
      });
    }

    const id = req.params.id as string;
    const milestoneId = req.params.milestoneId as string;

    const milestone = await prisma.pilotMilestone.findUnique({
      where: { id: milestoneId },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    await prisma.pilotMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'APPROVED',
        paymentStatus: 'APPROVED',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Milestone Approved',
        details: `Milestone "${milestone.name}" approved. Payment of ₹${milestone.paymentAmount.toLocaleString()} authorized.`,
      },
    });

    return res.json({
      success: true,
      message: 'Milestone approved and payment status set to APPROVED',
    });
  } catch (error) {
    next(error);
  }
};

export const validatePilotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'EVALUATOR') {
      return res.status(403).json({
        success: false,
        message: 'Only independent evaluators can validate pilots',
      });
    }

    const id = req.params.id as string;
    const {
      startupClaim,
      target,
      evidence,
      measurementMethod,
      independentResult,
      status,
      comments,
    } = req.body;

    const pilot = await prisma.pilot.findUnique({
      where: { id },
      include: { startup: true, challenge: true },
    });

    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: 'Pilot project not found',
      });
    }

    // 1. Create validation entry
    await prisma.pilotValidation.create({
      data: {
        pilotId: id,
        validatorId: userId,
        validatorName: (req as any).user.name || 'Dr. A.K. Sinha',
        startupClaim,
        target,
        evidence,
        measurementMethod,
        independentResult,
        status,
        comments,
      },
    });

    // Calculate Scale Readiness Score (weights defined in GIPP details):
    // Impact: 30%, Technical Readiness: 20%, KPI Achievement: 20%, Scalability: 10%, Cost Effectiveness: 10%, Risk: 5%, Security: 5%
    // Since validator scores these or we calculate them dynamically based on results:
    // Let's calculate:
    const kpiMatch = parseFloat(independentResult) >= parseFloat(target);
    const kpiRatio = Math.min(1.2, parseFloat(independentResult) / (parseFloat(target) || 1));
    
    // Weighted deterministic components:
    const kpiScore = kpiMatch ? 95 : 75; // 20% weight
    const impactScore = kpiRatio > 1 ? 95 : 85; // 30% weight
    const techScore = 90; // 20% weight
    const scalabilityScore = 90; // 10% weight
    const costScore = 85; // 10% weight
    const riskScore = 90; // 5% weight (low risk = high score)
    const securityScore = 95; // 5% weight

    const scaleScore = Math.round(
      impactScore * 0.3 +
      techScore * 0.2 +
      kpiScore * 0.2 +
      scalabilityScore * 0.1 +
      costScore * 0.1 +
      riskScore * 0.05 +
      securityScore * 0.05
    );

    // Score: 80–100 -> READY_FOR_SCALE_REVIEW
    // 60–79 -> RE-PILOT
    // Below 60 -> CLOSE
    let scaleDecision = 'CLOSE';
    if (scaleScore >= 80) {
      scaleDecision = 'READY_FOR_SCALE_REVIEW';
    } else if (scaleScore >= 60) {
      scaleDecision = 'RE_PILOT';
    }

    // Update pilot status & scoring
    await prisma.pilot.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        scaleScore,
        scaleDecision,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Validation Submitted',
        details: `Pilot validation submitted. Scale score: ${scaleScore}/100. Recommendation: "${scaleDecision.replace(/_/g, ' ')}"`,
      },
    });

    logger.info('Pilot validated successfully', { pilotId: id, scaleScore });

    return res.json({
      success: true,
      message: 'Independent validation complete',
    });
  } catch (error) {
    next(error);
  }
};

export const generatePilotPassportController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const id = req.params.id as string;

    const pilot = await prisma.pilot.findUnique({
      where: { id },
      include: {
        startup: true,
        challenge: true,
        kpis: true,
        milestones: true,
        validations: true,
      },
    });

    if (!pilot) {
      return res.status(404).json({
        success: false,
        message: 'Pilot not found',
      });
    }

    // Ensure it's validated
    if (pilot.status !== 'VALIDATED') {
      return res.status(400).json({
        success: false,
        message: 'Pilot results must be independently validated before generating a GIPP',
      });
    }

    // Check if passport already exists
    const existing = await prisma.pilotPassport.findUnique({
      where: { pilotId: id },
    });

    if (existing) {
      return res.json({
        success: true,
        passport: existing,
      });
    }

    // Generate Passport Number
    const deptPrefix = pilot.challenge.department.split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 5);
    const randNum = Math.floor(100 + Math.random() * 900);
    const passportNumber = `${deptPrefix}-GIPP-2026-${randNum}`;

    // Recommendations string
    let recommendation = 'CLOSE';
    if ((pilot.scaleScore || 0) >= 80) {
      recommendation = 'READY FOR SCALE-UP REVIEW';
    } else if ((pilot.scaleScore || 0) >= 60) {
      recommendation = 'RE-PILOT / IMPROVE';
    }

    const passportData = {
      challengeTitle: pilot.challenge.title,
      department: pilot.challenge.department,
      sector: pilot.challenge.sector,
      problemDescription: pilot.challenge.problemDescription,
      expectedOutcome: pilot.challenge.expectedOutcome,
      startupName: pilot.startup.name,
      startupTechnology: pilot.startup.technology,
      proposedSolution: pilot.objectives,
      pilotLocation: pilot.location,
      pilotDuration: `${pilot.startDate} to ${pilot.endDate}`,
      kpis: pilot.kpis.map((k: any) => ({
        name: k.name,
        unit: k.unit,
        baseline: k.baseline,
        target: k.target,
        minimum: k.minimum,
        currentValue: k.currentValue,
        status: k.status,
      })),
      milestones: pilot.milestones.map((m: any) => ({
        name: m.name,
        description: m.description,
        deadline: m.deadline,
        deliverable: m.deliverable,
        paymentAmount: m.paymentAmount,
        status: m.status,
      })),
      validation: pilot.validations[0] || {},
    };

    const passport = await prisma.pilotPassport.create({
      data: {
        pilotId: id,
        passportNumber,
        data: JSON.stringify(passportData),
        scaleScore: pilot.scaleScore || 85,
        recommendation,
      },
    });

    await prisma.pilot.update({
      where: { id },
      data: { status: 'COMPLETED' }, // final completed state
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Pilot Passport Generated',
        details: `Innovation Passport Generated: ${passportNumber} for Startup "${pilot.startup.name}"`,
      },
    });

    return res.json({
      success: true,
      passport,
    });
  } catch (error) {
    next(error);
  }
};

export const getPilotPassportDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string; // pilotId or passportId

    const passport = await prisma.pilotPassport.findFirst({
      where: {
        OR: [
          { id },
          { pilotId: id },
        ],
      },
    });

    if (!passport) {
      return res.status(404).json({
        success: false,
        message: 'Pilot Passport not found',
      });
    }

    return res.json(passport);
  } catch (error) {
    next(error);
  }
};

export const getEvidenceRepositoryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.query as string | undefined;

    const passports = await prisma.pilotPassport.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (!query) {
      return res.json(passports);
    }

    const keyword = (query as string).toLowerCase();
    const filtered = passports.filter((passport) => {
      const dataObj = JSON.parse(passport.data);
      const dataStr = (
        passport.passportNumber + ' ' +
        passport.recommendation + ' ' +
        (dataObj.challengeTitle || '') + ' ' +
        (dataObj.department || '') + ' ' +
        (dataObj.sector || '') + ' ' +
        (dataObj.startupName || '') + ' ' +
        (dataObj.startupTechnology || '') + ' ' +
        (dataObj.proposedSolution || '')
      ).toLowerCase();

      return dataStr.includes(keyword);
    });

    return res.json(filtered);
  } catch (error) {
    next(error);
  }
};
