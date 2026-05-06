import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// Endpoint público para iniciar sesión (No requiere authMiddleware)
router.post('/login', authController.login);

// Endpoint público para refrescar la sesión (El propio token de refresco actúa como auth)
router.post('/refresh', authController.refreshSession);

export default router;