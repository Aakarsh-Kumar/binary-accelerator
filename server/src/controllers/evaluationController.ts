import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import logger from '../utils/logger';

export const getEvaluationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    let evaluations: any[] = [];

    if (userRole === 'EVALUATOR') {
      evaluations = await prisma.evaluation.findMany({
        where: { evaluatorId: userId },
        include: {
          application: {
            include: {
              challenge: true,
              startup: true,
            },
          },
        },
      });
    } else if (userRole === 'GOVERNMENT') {
      evaluations = await prisma.evaluation.findMany({
        include: {
          evaluator: true,
          application: {
            include: {
              challenge: true,
              startup: true,
            },
          },
        },
      });
    }

    return res.json(evaluations);
  } catch (error) {
    next(error);
  }
};

export const submitEvaluationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'EVALUATOR') {
      return res.status(403).json({
        success: false,
        message: 'Only assigned evaluators can submit scores',
      });
    }

    const {
      applicationId,
      hasConflict,
      scoreTechnicalFit,
      scoreProblemFit,
      scoreInnovation,
      scoreScalability,
      scoreCostEffectiveness,
      scoreCybersecurity,
      scoreTeamCapability,
      comments,
      strengths,
      risks,
      recommendation,
    } = req.body;

    // Verify evaluation record exists
    const evaluationRecord = await prisma.evaluation.findFirst({
      where: { applicationId, evaluatorId: userId },
      include: {
        application: {
          include: {
            startup: true,
            challenge: true,
          },
        },
      },
    });

    if (!evaluationRecord) {
      return res.status(404).json({
        success: false,
        message: 'No active evaluation assignment found for this application',
      });
    }

    // 1. Conflict of Interest Check
    if (hasConflict) {
      // Update evaluation to blocked
      const updatedEval = await prisma.evaluation.update({
        where: { id: evaluationRecord.id },
        data: {
          hasConflict: true,
          totalScore: 0,
          comments: 'Blocked due to declared conflict of interest.',
          recommendation: 'CONFLICT_BLOCKED',
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'Conflict of Interest Declared',
          details: `Evaluator "${(req as any).user.email}" declared conflict for startup "${evaluationRecord.application.startup.name}". Evaluation blocked.`,
        },
      });

      logger.warn('Evaluator declared conflict', { userId, applicationId });

      return res.json(updatedEval);
    }

    // 2. Perform Weighted Scoring Calculations
    // Technical Fit: 25%, Problem Fit: 20%, Innovation: 20%, Scalability: 15%, Cost Effectiveness: 10%, Cybersecurity: 5%, Team Capability: 5%
    const totalScore =
      scoreTechnicalFit * 0.25 +
      scoreProblemFit * 0.2 +
      scoreInnovation * 0.2 +
      scoreScalability * 0.15 +
      scoreCostEffectiveness * 0.1 +
      scoreCybersecurity * 0.05 +
      scoreTeamCapability * 0.05;

    const updatedEval = await prisma.evaluation.update({
      where: { id: evaluationRecord.id },
      data: {
        hasConflict: false,
        scoreTechnicalFit: parseFloat(scoreTechnicalFit),
        scoreProblemFit: parseFloat(scoreProblemFit),
        scoreInnovation: parseFloat(scoreInnovation),
        scoreScalability: parseFloat(scoreScalability),
        scoreCostEffectiveness: parseFloat(scoreCostEffectiveness),
        scoreCybersecurity: parseFloat(scoreCybersecurity),
        scoreTeamCapability: parseFloat(scoreTeamCapability),
        totalScore: Math.round(totalScore * 10) / 10,
        comments,
        strengths,
        risks,
        recommendation,
      },
    });

    // Check if other evaluations exist and compute aggregate average
    const allEvaluations = await prisma.evaluation.findMany({
      where: { applicationId, hasConflict: false },
    });

    const activeScores = allEvaluations.filter((e) => e.totalScore > 0);
    const avgScore = activeScores.reduce((acc, curr) => acc + curr.totalScore, 0) / (activeScores.length || 1);

    // If evaluations are completed, mark application as evaluated
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        eligibilityStatus: 'SHORTLISTED', // promote to shortlisted once evaluated
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'Evaluation Submitted',
        details: `Evaluator submitted score ${updatedEval.totalScore}/100 for startup "${evaluationRecord.application.startup.name}"`,
      },
    });

    logger.info('Evaluation submitted successfully', { evaluationId: updatedEval.id, totalScore });

    return res.json(updatedEval);
  } catch (error) {
    next(error);
  }
};
