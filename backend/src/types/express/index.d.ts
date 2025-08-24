import type { Multer } from "multer";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      role: string;
    }

    interface Request {
      user?: UserPayload;   // make optional so it's valid before auth
      file?: Multer.File;
      files?: Multer.File[] | {
        [fieldname: string]: Multer.File[];
      };
    }
  }
}

export {};
