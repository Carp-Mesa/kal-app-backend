import { Router } from 'express';
import { waterController } from '../controllers/water.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Rutas específicas
router.get('/progress/today', waterController.getTodayProgress);

// CRUD estándar
router.get('/', waterController.getLogs);
router.post('/', waterController.createLog);
router.put('/:id', waterController.updateLog);
router.delete('/:id', waterController.deleteLog);

export default router;