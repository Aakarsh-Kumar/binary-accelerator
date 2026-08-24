import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../models';
import logger from '../utils/logger';

export const resetDemoData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Clear database in order of dependencies
    await prisma.auditLog.deleteMany({});
    await prisma.pilotPassport.deleteMany({});
    await prisma.pilotValidation.deleteMany({});
    await prisma.pilotEvidence.deleteMany({});
    await prisma.pilotMilestone.deleteMany({});
    await prisma.pilotKpi.deleteMany({});
    await prisma.pilot.deleteMany({});
    await prisma.evaluation.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.challenge.deleteMany({});
    await prisma.startupProfile.deleteMany({});
    await prisma.user.deleteMany({});

    logger.info('Database cleared successfully for demo reset.');

    // 2. Generate password hashes
    const saltRounds = 10;
    const defaultPasswordHash = await bcrypt.hash('password123', saltRounds);

    // 3. Create Seed Users
    // Government Users
    const govUser1 = await prisma.user.create({
      data: {
        email: 'gov@govinnovate.gov.in',
        name: 'Priya Sharma',
        role: 'GOVERNMENT',
        onboardingCompleted: true,
        username: 'priya_mhua',
        passwordHash: defaultPasswordHash,
      },
    });

    const govUser2 = await prisma.user.create({
      data: {
        email: 'officer@morth.gov.in',
        name: 'Amit Verma',
        role: 'GOVERNMENT',
        onboardingCompleted: true,
        username: 'amit_morth',
        passwordHash: defaultPasswordHash,
      },
    });

    // Startup Users
    const startupUser1 = await prisma.user.create({
      data: {
        email: 'startup1@wasteai.com',
        name: 'SmartWaste Solutions',
        role: 'STARTUP',
        onboardingCompleted: true,
        username: 'smartwaste_ai',
        passwordHash: defaultPasswordHash,
      },
    });

    const startupUser2 = await prisma.user.create({
      data: {
        email: 'startup2@trafficflow.io',
        name: 'TrafficFlow Systems',
        role: 'STARTUP',
        onboardingCompleted: true,
        username: 'trafficflow_sys',
        passwordHash: defaultPasswordHash,
      },
    });

    const startupUser3 = await prisma.user.create({
      data: {
        email: 'startup3@waterguard.co',
        name: 'WaterGuard IoT',
        role: 'STARTUP',
        onboardingCompleted: true,
        username: 'waterguard_iot',
        passwordHash: defaultPasswordHash,
      },
    });

    // Evaluators
    const evalUser1 = await prisma.user.create({
      data: {
        email: 'eval1@expert.res.in',
        name: 'Dr. A.K. Sinha',
        role: 'EVALUATOR',
        onboardingCompleted: true,
        username: 'ak_sinha_iitd',
        passwordHash: defaultPasswordHash,
      },
    });

    const evalUser2 = await prisma.user.create({
      data: {
        email: 'eval2@expert.res.in',
        name: 'Prof. Rajesh Patel',
        role: 'EVALUATOR',
        onboardingCompleted: true,
        username: 'rajesh_patel_iisc',
        passwordHash: defaultPasswordHash,
      },
    });

    const evalUser3 = await prisma.user.create({
      data: {
        email: 'eval3@expert.res.in',
        name: 'Dr. Sunita Rao',
        role: 'EVALUATOR',
        onboardingCompleted: true,
        username: 'sunita_rao_csir',
        passwordHash: defaultPasswordHash,
      },
    });

    logger.info('Users seeded.');

    // 4. Create Startup Profiles
    const startupProfile1 = await prisma.startupProfile.create({
      data: {
        userId: startupUser1.id,
        name: 'SmartWaste Solutions Private Limited',
        industry: 'Urban Tech / Waste Management',
        technology: 'AI Computer Vision, IoT Sensors, Route Optimization Algorithms',
        technologies: 'AI Computer Vision, IoT Sensors, Route Optimization Algorithms',
        teamSize: 18,
        yearsOperating: 3,
        productDescription: 'Autonomous trash fill-level IoT devices coupled with computer vision cameras on garbage vans to automate routing, improving municipal collection productivity.',
        deployments: 'Successfully ran a 10-bin validation in Indore Sector 4, reporting a 20% reduction in vehicle emissions.',
        certifications: 'ISO 9001:2015, DPIIT Registered Startup',
      },
    });

    const startupProfile2 = await prisma.startupProfile.create({
      data: {
        userId: startupUser2.id,
        name: 'TrafficFlow AI Systems',
        industry: 'Smart Transport',
        technology: 'Deep Learning Vision, Traffic Analytics Software',
        technologies: 'Deep Learning Vision, Traffic Analytics Software',
        teamSize: 12,
        yearsOperating: 2,
        productDescription: 'Plug-and-play camera feeds integration to adjust signal durations dynamically, reducing intersection choke-points.',
        deployments: 'Tested at 3 crossroads in Pune, clearing local bottlenecks.',
        certifications: 'DPIIT Registered Startup',
      },
    });

    const startupProfile3 = await prisma.startupProfile.create({
      data: {
        userId: startupUser3.id,
        name: 'WaterGuard Analytics',
        industry: 'Water Resource Management',
        technology: 'IoT Spectroscopy Sensors, Smart Edge Telemetry',
        technologies: 'IoT Spectroscopy Sensors, Smart Edge Telemetry',
        teamSize: 8,
        yearsOperating: 1,
        productDescription: 'Solar-powered buoys that measure chemical contamination levels in reservoirs in real-time.',
        deployments: 'Prototype validation completed in a localized lake.',
        certifications: 'NABL Certified Sensor Testing',
      },
    });

    logger.info('Startup profiles seeded.');

    // 5. Seed Challenges
    // Showcase primary challenge (unstructured -> outcome-oriented structured)
    const showcaseChallenge = await prisma.challenge.create({
      data: {
        title: 'Smart Waste Collection Optimization',
        department: 'Municipal Corporation / Ministry of Housing & Urban Affairs',
        sector: 'Urban Sanitation',
        problemDescription: 'Increase waste collection efficiency by automating pickup vehicle dispatching using fill-level alerts. The current manual routing is inefficient and leads to fuel wastage and overflowing bins.',
        baseline: 'Waste collection efficiency is currently at 65% across sectors.',
        expectedOutcome: 'Increase municipal waste collection efficiency from 65% to at least 85% within 90 days.',
        budget: 1500000,
        duration: '90 Days',
        location: 'Sector 5 Municipal Area',
        eligibility: 'DPIIT Registered startups with a functional IoT prototype and basic ISO certification.',
        successKpis: 'Waste Collection Efficiency >= 85%, Vehicle Fuel Consumption reduction >= 15%, Complaint resolution time < 4 hours.',
        status: 'PUBLISHED',
        createdById: govUser1.id,
      },
    });

    // Seed 2 additional past/different challenges
    const pastChallenge1 = await prisma.challenge.create({
      data: {
        title: 'Real-Time Intersection Choke Clearing',
        department: 'Department of Urban Transport',
        sector: 'Smart Traffic',
        problemDescription: 'Reduce average signal wait times at major intersections using sensor-driven camera automation.',
        baseline: 'Average rush-hour wait time of 180 seconds per vehicle.',
        expectedOutcome: 'Reduce peakwait times by at least 25% (under 135 seconds) over 60 days.',
        budget: 1200000,
        duration: '60 Days',
        location: 'Kailash Intersection',
        eligibility: 'Startups with functional camera integration modules and field deployment readiness.',
        successKpis: 'Wait time reduction >= 25%, Setup installation time < 10 days.',
        status: 'CLOSED',
        createdById: govUser1.id,
      },
    });

    const pastChallenge2 = await prisma.challenge.create({
      data: {
        title: 'Water Reservoir Chemical Contamination Alerting',
        department: 'Water Supply Department',
        sector: 'Water Resources',
        problemDescription: 'Deploy real-time sensing buoys to monitor pH, turbidity, and oxygenation levels dynamically.',
        baseline: 'Manual lab test sampling conducted once every 7 days.',
        expectedOutcome: 'Continuous real-time anomaly alerts transmitted directly to central server with 98% uptime.',
        budget: 1800000,
        duration: '120 Days',
        location: 'Central Lake Reservoir',
        eligibility: 'Hardware startups with water-resistant edge telemetry buoys.',
        successKpis: 'Telemetry Uptime >= 98%, Sensor calibration error rate < 3%.',
        status: 'CLOSED',
        createdById: govUser1.id,
      },
    });

    logger.info('Challenges seeded.');

    // Seed Applications for Past Pilots to prevent foreign key violations
    await prisma.application.create({
      data: {
        id: 'seed-app-1',
        challengeId: pastChallenge1.id,
        startupId: startupProfile2.id,
        proposedSolution: 'TrafficFlow Camera analytics interface',
        technicalApproach: 'Deep learning vision model tracking intersection queues.',
        implementationPlan: 'Mount cameras and deploy flow analytics software.',
        expectedImpact: 'Reduce peak wait times by 25%.',
        pilotPlan: '60-day pilot testing.',
        estimatedCost: 1200000,
        supportingDocuments: 'traffic_proposal.pdf',
        eligibilityStatus: 'SELECTED',
        compatibilityScore: 92,
        matchDetails: JSON.stringify({ techScore: 90, domainScore: 95, capabilityScore: 92, maturityScore: 90 }),
      },
    });

    await prisma.application.create({
      data: {
        id: 'seed-app-2',
        challengeId: pastChallenge2.id,
        startupId: startupProfile3.id,
        proposedSolution: 'Telemetry Spectrograph Buoys',
        technicalApproach: 'Spectroscopy buoys measuring oxygenation levels in real-time.',
        implementationPlan: 'Anchoring smart sensor buoys across reservoir.',
        expectedImpact: '98% uptime telemetry alerts.',
        pilotPlan: '120-day pilot testing.',
        estimatedCost: 1800000,
        supportingDocuments: 'water_proposal.pdf',
        eligibilityStatus: 'SELECTED',
        compatibilityScore: 74,
        matchDetails: JSON.stringify({ techScore: 70, domainScore: 75, capabilityScore: 78, maturityScore: 73 }),
      },
    });

    // 6. Seed Past Pilot Passports (for reuse repository)
    // Pilot 1: Traffic Clearing
    const pastPilot1 = await prisma.pilot.create({
      data: {
        startupId: startupProfile2.id,
        challengeId: pastChallenge1.id,
        applicationId: 'seed-app-1',
        location: 'Kailash Intersection',
        startDate: '2025-09-01',
        endDate: '2025-11-01',
        budget: 1200000,
        objectives: 'Adapt traffic light timers using real-time camera feed counts.',
        status: 'COMPLETED',
        scaleScore: 92,
        scaleDecision: 'READY_FOR_SCALE_REVIEW',
      },
    });

    const pastPassport1Data = {
      challengeTitle: pastChallenge1.title,
      department: pastChallenge1.department,
      sector: pastChallenge1.sector,
      problemDescription: pastChallenge1.problemDescription,
      expectedOutcome: pastChallenge1.expectedOutcome,
      startupName: startupProfile2.name,
      startupTechnology: startupProfile2.technology,
      proposedSolution: 'TrafficFlow Camera analytics interface',
      pilotLocation: pastPilot1.location,
      pilotDuration: '60 Days',
      kpis: [
        { name: 'Average Vehicle Wait Time', unit: 'sec', baseline: '180', target: '135', currentValue: '128', status: 'TARGET_ACHIEVED' },
        { name: 'Choke Clear Speed', unit: 'min', baseline: '15', target: '10', currentValue: '8', status: 'TARGET_ACHIEVED' },
      ],
      milestones: [
        { name: 'M1 - Setup and Cam Integration', description: 'Deploy feeds and mount logic', deadline: '15 Days', deliverable: 'Active stream', paymentAmount: 300000, status: 'APPROVED' },
        { name: 'M2 - Final Validation', description: 'Validate peak flow timers', deadline: '45 Days', deliverable: 'Wait metrics logs', paymentAmount: 900000, status: 'APPROVED' },
      ],
      validation: {
        validatorName: 'Dr. A.K. Sinha',
        startupClaim: '128 seconds wait time',
        target: '135 seconds',
        independentResult: '130 seconds',
        status: 'VALIDATED',
        comments: 'Verified camera counters against manual counts. Wait reductions are solid and recommendation holds.',
      },
    };

    await prisma.pilotPassport.create({
      data: {
        pilotId: pastPilot1.id,
        passportNumber: 'UD-GIPP-2025-015',
        data: JSON.stringify(pastPassport1Data),
        scaleScore: 92,
        recommendation: 'READY FOR SCALE-UP REVIEW',
      },
    });

    // Pilot 2: Water Resources
    const pastPilot2 = await prisma.pilot.create({
      data: {
        startupId: startupProfile3.id,
        challengeId: pastChallenge2.id,
        applicationId: 'seed-app-2',
        location: 'Central Lake Reservoir',
        startDate: '2025-06-01',
        endDate: '2025-10-01',
        budget: 1800000,
        objectives: 'Deploy chemical telemetry sensing buoys.',
        status: 'COMPLETED',
        scaleScore: 74,
        scaleDecision: 'RE_PILOT',
      },
    });

    const pastPassport2Data = {
      challengeTitle: pastChallenge2.title,
      department: pastChallenge2.department,
      sector: pastChallenge2.sector,
      problemDescription: pastChallenge2.problemDescription,
      expectedOutcome: pastChallenge2.expectedOutcome,
      startupName: startupProfile3.name,
      startupTechnology: startupProfile3.technology,
      proposedSolution: 'Telemetry Spectrograph Buoys',
      pilotLocation: pastPilot2.location,
      pilotDuration: '120 Days',
      kpis: [
        { name: 'Telemetry Uptime', unit: '%', baseline: '0', target: '98', currentValue: '94', status: 'IN_PROGRESS' },
        { name: 'Sensor Calibration Error', unit: '%', baseline: '5', target: '3', currentValue: '3.5', status: 'IN_PROGRESS' },
      ],
      milestones: [
        { name: 'M1 - Buoy Deployment', description: 'Mount spectrograph buoy', deadline: '20 Days', deliverable: 'Buoy anchored', paymentAmount: 500000, status: 'APPROVED' },
        { name: 'M2 - Stream Integration', description: 'Telemetry link configuration', deadline: '60 Days', deliverable: 'Uptime reports', paymentAmount: 1300000, status: 'APPROVED' },
      ],
      validation: {
        validatorName: 'Dr. Sunita Rao',
        startupClaim: '94% sensor uptime verified',
        target: '98%',
        independentResult: '93.5%',
        status: 'PARTIALLY_VALIDATED',
        comments: 'Chemical detection is highly accurate, but battery drainage caused telemetry drop-offs in heavy monsoon clouds. Recommend re-pilot with higher capacity solar cells.',
      },
    };

    await prisma.pilotPassport.create({
      data: {
        pilotId: pastPilot2.id,
        passportNumber: 'WS-GIPP-2025-048',
        data: JSON.stringify(pastPassport2Data),
        scaleScore: 74,
        recommendation: 'RE-PILOT / IMPROVE',
      },
    });

    logger.info('Past GIPPs and evidence repository seeded.');

    // 7. Seed Active Applications & Evaluations
    // Startup 2 and 3 applied to showcase challenge
    const appFromStartup2 = await prisma.application.create({
      data: {
        challengeId: showcaseChallenge.id,
        startupId: startupProfile2.id,
        proposedSolution: 'TrafficFlow Waste Management Extension',
        technicalApproach: 'Use current intersection traffic cameras to detect garbage van occupancy and route them dynamically.',
        implementationPlan: 'Mount vision nodes on garbage collector containers.',
        expectedImpact: '15% reduction in transit cycle time.',
        pilotPlan: 'Run testing in Ward 3 over 45 days.',
        estimatedCost: 1100000,
        supportingDocuments: 'traffic_waste_tech.pdf',
        eligibilityStatus: 'UNDER_EVALUATION',
        compatibilityScore: 78,
        matchDetails: JSON.stringify({ techScore: 75, domainScore: 70, capabilityScore: 85, maturityScore: 82 }),
      },
    });

    // Seeding completed evaluation for Startup 2
    await prisma.evaluation.create({
      data: {
        applicationId: appFromStartup2.id,
        evaluatorId: evalUser1.id,
        hasConflict: false,
        scoreTechnicalFit: 78,
        scoreProblemFit: 80,
        scoreInnovation: 75,
        scoreScalability: 82,
        scoreCostEffectiveness: 85,
        scoreCybersecurity: 90,
        scoreTeamCapability: 80,
        totalScore: 79.5,
        comments: 'Technical fit is somewhat complex because it adapts traffic modules for trash detection, but team capacity is good.',
        strengths: 'Excellent team structure, robust hardware',
        risks: 'Potential camera mounting alignment issues',
        recommendation: 'RECOMMENDED',
      },
    });

    // 8. Log initial audit events
    await prisma.auditLog.create({
      data: { action: 'Challenge Created', details: 'Smart Waste Collection Optimization challenge drafts initialized.' },
    });
    await prisma.auditLog.create({
      data: { action: 'Challenge Published', details: 'Smart Waste Collection Optimization challenge published for startups.' },
    });
    await prisma.auditLog.create({
      data: { action: 'Application Submitted', details: 'TrafficFlow Systems applied to Smart Waste Collection Optimization challenge.' },
    });

    logger.info('Demo seed completed successfully.');

    return res.json({
      success: true,
      message: 'Demo database initialized and seeded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
