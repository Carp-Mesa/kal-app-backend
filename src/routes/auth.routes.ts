import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Endpoint público para iniciar sesión (No requiere authMiddleware)
router.post('/login', authController.login);

export default router;