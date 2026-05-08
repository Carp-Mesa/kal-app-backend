import { Router } from 'express';
import { historyController } from '../controllers/history.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', historyController.getSummary);

export default router;
