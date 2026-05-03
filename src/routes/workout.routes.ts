import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos el módulo de Entrenamientos
router.use(authMiddleware);

// Rutas
router.post('/', workoutController.createFullWorkout);

export default router;