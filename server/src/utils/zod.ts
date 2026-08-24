import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core';
import { z } from 'zod';

const postAuthlogin_Body = z
  .object({ email: z.string(), password: z.string() })
  .passthrough();
const User = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
    onboardingCompleted: z.boolean(),
    username: z.string(),
    avatarUrl: z.string().nullish(),
  })
  .passthrough();
const AuthResponse = z
  .object({ success: z.boolean(), user: User, token: z.string().optional() })
  .passthrough();
const SuccessResponse = z
  .object({ success: z.boolean(), message: z.string() })
  .passthrough();
const ChallengeResponse = z
  .object({
    id: z.string(),
    title: z.string(),
    department: z.string(),
    sector: z.string(),
    problemDescription: z.string(),
    baseline: z.string(),
    expectedOutcome: z.string(),
    budget: z.number(),
    duration: z.string(),
    location: z.string(),
    eligibility: z.string(),
    successKpis: z.string(),
    status: z.string(),
    createdById: z.string(),
    createdAt: z.string(),
  })
  .passthrough();
const ChallengeRequest = z
  .object({
    title: z.string(),
    department: z.string(),
    sector: z.string(),
    problemDescription: z.string(),
    baseline: z.string(),
    expectedOutcome: z.string(),
    budget: z.number(),
    duration: z.string(),
    location: z.string(),
    eligibility: z.string(),
    successKpis: z.string(),
    status: z.string(),
  })
  .passthrough();
const StartupProfileRequest = z
  .object({
    name: z.string(),
    industry: z.string(),
    technology: z.string(),
    teamSize: z.number().int(),
    yearsOperating: z.number().int(),
    productDescription: z.string(),
    deployments: z.string(),
    certifications: z.string(),
  })
  .passthrough();
const StartupProfileResponse = z
  .object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    industry: z.string(),
    technology: z.string(),
    teamSize: z.number().int(),
    yearsOperating: z.number().int(),
    productDescription: z.string(),
    deployments: z.string(),
    certifications: z.string(),
    createdAt: z.string(),
  })
  .passthrough();
const ApplicationResponse = z
  .object({
    id: z.string(),
    challengeId: z.string(),
    startupId: z.string(),
    proposedSolution: z.string(),
    technicalApproach: z.string(),
    implementationPlan: z.string(),
    expectedImpact: z.string(),
    pilotPlan: z.string(),
    estimatedCost: z.number(),
    supportingDocuments: z.string(),
    eligibilityStatus: z.string(),
    compatibilityScore: z.number(),
    matchDetails: z.string(),
    createdAt: z.string(),
    challenge: ChallengeResponse.optional(),
    startup: StartupProfileResponse.optional(),
  })
  .passthrough();
const ApplicationRequest = z
  .object({
    challengeId: z.string(),
    proposedSolution: z.string(),
    technicalApproach: z.string(),
    implementationPlan: z.string(),
    expectedImpact: z.string(),
    pilotPlan: z.string(),
    estimatedCost: z.number(),
    supportingDocuments: z.string(),
  })
  .passthrough();
const AssignEvaluatorsRequest = z
  .object({ evaluatorIds: z.array(z.string()) })
  .passthrough();
const EvaluationResponse = z
  .object({
    id: z.string(),
    applicationId: z.string(),
    evaluatorId: z.string(),
    hasConflict: z.boolean(),
    scoreTechnicalFit: z.number(),
    scoreProblemFit: z.number(),
    scoreInnovation: z.number(),
    scoreScalability: z.number(),
    scoreCostEffectiveness: z.number(),
    scoreCybersecurity: z.number(),
    scoreTeamCapability: z.number(),
    totalScore: z.number(),
    comments: z.string(),
    strengths: z.string(),
    risks: z.string(),
    recommendation: z.string(),
    createdAt: z.string(),
    evaluator: User.optional(),
  })
  .passthrough();
const EvaluationRequest = z
  .object({
    applicationId: z.string(),
    hasConflict: z.boolean(),
    scoreTechnicalFit: z.number(),
    scoreProblemFit: z.number(),
    scoreInnovation: z.number(),
    scoreScalability: z.number(),
    scoreCostEffectiveness: z.number(),
    scoreCybersecurity: z.number(),
    scoreTeamCapability: z.number(),
    comments: z.string(),
    strengths: z.string(),
    risks: z.string(),
    recommendation: z.string(),
  })
  .passthrough();
const PilotKpiResponse = z
  .object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
    baseline: z.string(),
    target: z.string(),
    minimum: z.string(),
    currentValue: z.string().nullable(),
    evidenceUrl: z.string().nullish(),
    status: z.string(),
  })
  .passthrough();
const PilotMilestoneResponse = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    deadline: z.string(),
    deliverable: z.string(),
    paymentAmount: z.number(),
    status: z.string(),
    evidenceUrl: z.string().nullish(),
    paymentStatus: z.string(),
  })
  .passthrough();
const PilotValidationResponse = z
  .object({
    id: z.string(),
    validatorId: z.string(),
    validatorName: z.string(),
    startupClaim: z.string(),
    target: z.string(),
    evidence: z.string(),
    measurementMethod: z.string(),
    independentResult: z.string(),
    status: z.string(),
    comments: z.string(),
  })
  .passthrough();
const PilotPassportResponse = z
  .object({
    id: z.string(),
    pilotId: z.string(),
    passportNumber: z.string(),
    data: z.string(),
    scaleScore: z.number(),
    recommendation: z.string(),
    createdAt: z.string(),
  })
  .passthrough();
const PilotResponse = z
  .object({
    id: z.string(),
    startupId: z.string(),
    challengeId: z.string(),
    applicationId: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.number(),
    objectives: z.string(),
    status: z.string(),
    scaleDecision: z.string().nullish(),
    scaleScore: z.number().nullish(),
    createdAt: z.string(),
    challenge: ChallengeResponse.optional(),
    startup: StartupProfileResponse.optional(),
    kpis: z.array(PilotKpiResponse).optional(),
    milestones: z.array(PilotMilestoneResponse).optional(),
    validations: z.array(PilotValidationResponse).optional(),
    passports: z.array(PilotPassportResponse).optional(),
  })
  .passthrough();
const PilotRequest = z
  .object({
    applicationId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    budget: z.number(),
    objectives: z.string(),
    kpis: z.array(
      z
        .object({
          name: z.string(),
          unit: z.string(),
          baseline: z.string(),
          target: z.string(),
          minimum: z.string(),
        })
        .passthrough(),
    ),
    milestones: z.array(
      z
        .object({
          name: z.string(),
          description: z.string(),
          deadline: z.string(),
          deliverable: z.string(),
          paymentAmount: z.number(),
        })
        .passthrough(),
    ),
  })
  .passthrough();
const UpdateKpiRequest = z
  .object({ currentValue: z.string(), evidenceUrl: z.string() })
  .passthrough();
const UpdateMilestoneRequest = z
  .object({ evidenceUrl: z.string() })
  .passthrough();
const ValidationRequest = z
  .object({
    startupClaim: z.string(),
    target: z.string(),
    evidence: z.string(),
    measurementMethod: z.string(),
    independentResult: z.string(),
    status: z.string(),
    comments: z.string(),
  })
  .passthrough();
const PassportGenerationResponse = z
  .object({ success: z.boolean(), passport: PilotPassportResponse })
  .passthrough();
const AuditLogResponse = z
  .object({
    id: z.string(),
    action: z.string(),
    details: z.string(),
    timestamp: z.string(),
    user: User.optional(),
  })
  .passthrough();

export const schemas = {
  postAuthlogin_Body,
  User,
  AuthResponse,
  SuccessResponse,
  ChallengeResponse,
  ChallengeRequest,
  StartupProfileRequest,
  StartupProfileResponse,
  ApplicationResponse,
  ApplicationRequest,
  AssignEvaluatorsRequest,
  EvaluationResponse,
  EvaluationRequest,
  PilotKpiResponse,
  PilotMilestoneResponse,
  PilotValidationResponse,
  PilotPassportResponse,
  PilotResponse,
  PilotRequest,
  UpdateKpiRequest,
  UpdateMilestoneRequest,
  ValidationRequest,
  PassportGenerationResponse,
  AuditLogResponse,
};

const endpoints = makeApi([
  {
    method: 'get',
    path: '/applications',
    alias: 'getApplications',
    requestFormat: 'json',
    parameters: [
      {
        name: 'challengeId',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.array(ApplicationResponse),
  },
  {
    method: 'post',
    path: '/applications',
    alias: 'postApplications',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ApplicationRequest,
      },
    ],
    response: ApplicationResponse,
  },
  {
    method: 'post',
    path: '/applications/:id/assign',
    alias: 'postApplicationsIdassign',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AssignEvaluatorsRequest,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/audits',
    alias: 'getAudits',
    requestFormat: 'json',
    response: z.array(AuditLogResponse),
  },
  {
    method: 'post',
    path: '/auth/login',
    alias: 'postAuthlogin',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: postAuthlogin_Body,
      },
    ],
    response: AuthResponse,
  },
  {
    method: 'post',
    path: '/auth/logout',
    alias: 'postAuthlogout',
    requestFormat: 'json',
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/auth/me',
    alias: 'getAuthme',
    requestFormat: 'json',
    response: AuthResponse,
  },
  {
    method: 'get',
    path: '/challenges',
    alias: 'getChallenges',
    requestFormat: 'json',
    response: z.array(ChallengeResponse),
  },
  {
    method: 'post',
    path: '/challenges',
    alias: 'postChallenges',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ChallengeRequest,
      },
    ],
    response: ChallengeResponse,
  },
  {
    method: 'get',
    path: '/challenges/:id',
    alias: 'getChallengesId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: ChallengeResponse,
  },
  {
    method: 'post',
    path: '/demo/reset',
    alias: 'postDemoreset',
    requestFormat: 'json',
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/evaluations',
    alias: 'getEvaluations',
    requestFormat: 'json',
    response: z.array(EvaluationResponse),
  },
  {
    method: 'post',
    path: '/evaluations',
    alias: 'postEvaluations',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: EvaluationRequest,
      },
    ],
    response: EvaluationResponse,
  },
  {
    method: 'get',
    path: '/passports/repository',
    alias: 'getPassportsrepository',
    requestFormat: 'json',
    parameters: [
      {
        name: 'query',
        type: 'Query',
        schema: z.string().optional(),
      },
    ],
    response: z.array(PilotPassportResponse),
  },
  {
    method: 'get',
    path: '/pilots',
    alias: 'getPilots',
    requestFormat: 'json',
    response: z.array(PilotResponse),
  },
  {
    method: 'post',
    path: '/pilots',
    alias: 'postPilots',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: PilotRequest,
      },
    ],
    response: PilotResponse,
  },
  {
    method: 'get',
    path: '/pilots/:id',
    alias: 'getPilotsId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: PilotResponse,
  },
  {
    method: 'put',
    path: '/pilots/:id/kpis/:kpiId',
    alias: 'putPilotsIdkpisKpiId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: UpdateKpiRequest,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'kpiId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'put',
    path: '/pilots/:id/milestones/:milestoneId',
    alias: 'putPilotsIdmilestonesMilestoneId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ evidenceUrl: z.string() }).passthrough(),
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'milestoneId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/pilots/:id/milestones/:milestoneId/approve',
    alias: 'postPilotsIdmilestonesMilestoneIdapprove',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
      {
        name: 'milestoneId',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'get',
    path: '/pilots/:id/passport',
    alias: 'getPilotsIdpassport',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: PilotPassportResponse,
  },
  {
    method: 'post',
    path: '/pilots/:id/passport',
    alias: 'postPilotsIdpassport',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: PassportGenerationResponse,
  },
  {
    method: 'post',
    path: '/pilots/:id/validate',
    alias: 'postPilotsIdvalidate',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ValidationRequest,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: SuccessResponse,
  },
  {
    method: 'post',
    path: '/startups/profile',
    alias: 'postStartupsprofile',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: StartupProfileRequest,
      },
    ],
    response: StartupProfileResponse,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
