import { sampleController } from '../controllers/your-route-controllers';
import { validate, validateResponse } from '../middlewares/validate';
import { schemas } from '../utils/zod';

import { Router } from 'express';
const router = Router();

router.get(
  '/sample-endpoint',
  validate(schemas.SampleRequest),
  validateResponse(schemas.SuccessResponse),
  sampleController,
);

export default router;
