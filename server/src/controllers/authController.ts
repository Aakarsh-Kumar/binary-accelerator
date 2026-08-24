import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../models';
import { signToken } from '../utils/jwt';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies';
import logger from '../utils/logger';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { startupProfile: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        username: user.username,
        avatarUrl: user.avatarUrl,
        startupProfile: user.startupProfile,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    clearAuthCookie(res);
    logger.info('User logged out successfully');
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { startupProfile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        username: user.username,
        avatarUrl: user.avatarUrl,
        startupProfile: user.startupProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStartupProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { name, industry, technology, teamSize, yearsOperating, productDescription, deployments, certifications } = req.body;

    const startup = await prisma.startupProfile.upsert({
      where: { userId },
      update: {
        name,
        industry,
        technology,
        technologies: technology,
        teamSize: parseInt(teamSize),
        yearsOperating: parseInt(yearsOperating),
        productDescription,
        deployments,
        certifications,
      },
      create: {
        userId,
        name,
        industry,
        technology,
        technologies: technology,
        teamSize: parseInt(teamSize),
        yearsOperating: parseInt(yearsOperating),
        productDescription,
        deployments,
        certifications,
      },
    });

    // Mark onboarding as completed
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    logger.info('Startup profile updated', { userId });

    return res.json(startup);
  } catch (error) {
    next(error);
  }
};
