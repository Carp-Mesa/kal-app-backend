import { Router } from 'express';
import { sleepController } from '../controllers/sleep.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de sueño requieren autenticación
router.use(authMiddleware);

// Rutas analíticas
router.get('/progress/today', sleepController.getTodayProgress);
router.get('/recent', sleepController.getRecent);

// CRUD
router.get('/', sleepController.getLogs);
router.post('/', sleepController.createLog);
router.put('/:id', sleepController.updateLog);
router.delete('/:id', sleepController.deleteLog);

export default router;
