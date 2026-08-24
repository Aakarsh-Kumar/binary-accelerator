import { Request, Response, NextFunction } from 'express';
import prisma from '../models';
import logger from '../utils/logger';

export const getChallengesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sector = req.query.sector as string | undefined;
    const status = req.query.status as string | undefined;

    const filter: any = {};
    if (sector) filter.sector = sector as string;
    if (status) {
      filter.status = status as string;
    } else {
      filter.status = 'PUBLISHED'; // default to only published challenges for non-gov search
    }

    // If logged in as government, they should see drafts as well
    const userRole = (req as any).user?.role;
    if (userRole === 'GOVERNMENT') {
      delete filter.status; // allow gov to fetch all statuses
      if (status) {
        filter.status = status as string;
      }
    }

    const challenges = await prisma.challenge.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(challenges);
  } catch (error) {
    next(error);
  }
};

export const createChallengeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (userRole !== 'GOVERNMENT') {
      return res.status(403).json({
        success: false,
        message: 'Only Government Officers can create challenges',
      });
    }

    const {
      title,
      department,
      sector,
      problemDescription,
      baseline,
      expectedOutcome,
      budget,
      duration,
      location,
      eligibility,
      successKpis,
      status,
    } = req.body;

    const challenge = await prisma.challenge.create({
      data: {
        title,
        department,
        sector,
        problemDescription,
        baseline,
        expectedOutcome,
        budget: parseFloat(budget),
        duration,
        location,
        eligibility,
        successKpis,
        status: status || 'DRAFT',
        createdById: userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: status === 'PUBLISHED' ? 'Challenge Published' : 'Challenge Created',
        details: `Challenge: "${title}" created under sector ${sector}`,
      },
    });

    logger.info('Challenge created successfully', { challengeId: challenge.id, title });

    return res.status(201).json(challenge);
  } catch (error) {
    next(error);
  }
};

export const getChallengeDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            startup: true,
          },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    return res.json(challenge);
  } catch (error) {
    next(error);
  }
};
