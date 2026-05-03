import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authentication token' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Decode token without strict verification first to debug
    const supabase = require('../config/supabase').supabase;
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        console.error('Supabase Auth Error:', error?.message);
        res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
        return;
    }

    // Sub contains the user ID in Supabase
    req.user = { id: user.id };
    
    next();
  } catch (error: any) {
    console.error('Middleware Error:', error);
    res.status(401).json({ error: 'Invalid or expired token', message: error.message });
  }
};