import { Request, Response } from 'express';
import { historyService } from '../services/HistoryService';

export const historyController = {
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const days = Math.max(1, Math.min(365, parseInt(req.query.days as string) || 30));

      const summary = await historyService.getDailySummary(userId, days);
      res.status(200).json(summary);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};
