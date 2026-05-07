import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Protegemos el módulo de Entrenamientos
router.use(authMiddleware);

// Rutas
router.get('/progress/today', workoutController.getTodayProgress);
router.get('/history', workoutController.getHistory);
router.post('/', workoutController.createFullWorkout);

export default router;
