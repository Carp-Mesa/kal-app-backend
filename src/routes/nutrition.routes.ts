import { Router } from 'express';
import { nutritionController } from '../controllers/nutrition.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de nutrición requieren autenticación
router.use(authMiddleware);

router.get('/progress/today', nutritionController.getProgress);

router.get('/', nutritionController.getLogs);
router.post('/', nutritionController.createLog);
router.put('/:id', nutritionController.updateLog);
router.delete('/:id', nutritionController.deleteLog);

export default router;