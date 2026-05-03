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
    const secretStr = process.env.SUPABASE_JWT_SECRET;
    
    if (!secretStr) {
      console.error('SUPABASE_JWT_SECRET is not configured');
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const secret = new TextEncoder().encode(secretStr);
    
    // Validate JWT using jose
    const { payload } = await jwtVerify(token, secret);
    
    // Sub contains the user ID in Supabase
    req.user = { id: payload.sub as string };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};