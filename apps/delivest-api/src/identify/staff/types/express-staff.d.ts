import { AccessStaffTokenPayload } from '@delivest/types';

declare global {
  namespace Express {
    interface Request {
      staff: AccessStaffTokenPayload;
    }
  }
}
