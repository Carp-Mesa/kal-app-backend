import { Request, Response } from 'express';
import { nutritionService } from '../services/nutrition.service';

export const nutritionController = {
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id; // Obtenido del authMiddleware
      const logs = await nutritionService.getLogs(userId);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await nutritionService.getDailyProgress(userId);
      res.status(200).json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getWeeklyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const weeklyProgress = await nutritionService.getWeeklyProgress(userId);
      res.status(200).json(weeklyProgress);
    } catch (error: any) {
      console.error('[NutritionController] getWeeklyStats error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  async createLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { meal_name, calories, protein, carbs, fats } = req.body;
      
      if (!meal_name || calories === undefined || protein === undefined || carbs === undefined || fats === undefined) {
        res.status(400).json({ error: 'Faltan campos requeridos (meal_name, calories, protein, carbs, fats)' });
        return;
      }

      const newLog = await nutritionService.createLog(userId, { meal_name, calories, protein, carbs, fats });
      res.status(201).json(newLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const updateData = req.body;

      const updatedLog = await nutritionService.updateLog(userId, id, updateData);
      res.status(200).json(updatedLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      await nutritionService.deleteLog(userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};