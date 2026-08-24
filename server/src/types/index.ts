import { components } from './api';

export interface UserSession {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

// Structured schemas exported for convenient development use
export type ErrorResponse = components['schemas']['ErrorResponse'];
