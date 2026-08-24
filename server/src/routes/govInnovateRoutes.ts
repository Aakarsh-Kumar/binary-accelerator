import { Router } from 'express';
import { isAuthenticated, optionalAuth } from '../middlewares/auth';
import {
  loginController,
  logoutController,
  getMeController,
  updateStartupProfileController
} from '../controllers/authController';
import {
  getChallengesController,
  createChallengeController,
  getChallengeDetailsController
} from '../controllers/challengeController';
import {
  getApplicationsController,
  createApplicationController,
  assignEvaluatorsController
} from '../controllers/applicationController';
import {
  getEvaluationsController,
  submitEvaluationController
} from '../controllers/evaluationController';
import {
  getPilotsController,
  createPilotController,
  getPilotDetailsController,
  updatePilotKpiController,
  updatePilotMilestoneController,
  approvePilotMilestoneController,
  validatePilotController,
  generatePilotPassportController,
  getPilotPassportDetailsController,
  getEvidenceRepositoryController
} from '../controllers/pilotController';
import {
  resetDemoData
} from '../controllers/demoController';
import prisma from '../models';

const router = Router();

// Auth Routes
router.post('/auth/login', loginController);
router.post('/auth/logout', logoutController);
router.get('/auth/me', isAuthenticated, getMeController);

// Challenge Routes
router.get('/challenges', optionalAuth, getChallengesController);
router.post('/challenges', isAuthenticated, createChallengeController);
router.get('/challenges/:id', optionalAuth, getChallengeDetailsController);

// Startup Routes
router.post('/startups/profile', isAuthenticated, updateStartupProfileController);

// Application Routes
router.get('/applications', isAuthenticated, getApplicationsController);
router.post('/applications', isAuthenticated, createApplicationController);
router.post('/applications/:id/assign', isAuthenticated, assignEvaluatorsController);

// Evaluation Routes
router.get('/evaluations', isAuthenticated, getEvaluationsController);
router.post('/evaluations', isAuthenticated, submitEvaluationController);

// Pilot Routes
router.get('/pilots', isAuthenticated, getPilotsController);
router.post('/pilots', isAuthenticated, createPilotController);
router.get('/pilots/:id', isAuthenticated, getPilotDetailsController);
router.put('/pilots/:id/kpis/:kpiId', isAuthenticated, updatePilotKpiController);
router.put('/pilots/:id/milestones/:milestoneId', isAuthenticated, updatePilotMilestoneController);
router.post('/pilots/:id/milestones/:milestoneId/approve', isAuthenticated, approvePilotMilestoneController);
router.post('/pilots/:id/validate', isAuthenticated, validatePilotController);

// Passport & Evidence Routes
router.get('/pilots/:id/passport', isAuthenticated, getPilotPassportDetailsController);
router.post('/pilots/:id/passport', isAuthenticated, generatePilotPassportController);
router.get('/passports/repository', getEvidenceRepositoryController);

// Audits Route
router.get('/audits', isAuthenticated, async (req, res, next) => {
  try {
    const audits = await prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { timestamp: 'desc' },
    });
    return res.json(audits);
  } catch (error) {
    next(error);
  }
});

// Demo Seed Routes
router.post('/demo/reset', resetDemoData);

export default router;
