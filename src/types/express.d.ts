declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        email: string;
      };
    }
  }
}

export {};
