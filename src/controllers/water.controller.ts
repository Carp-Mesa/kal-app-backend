import { Request, Response } from 'express';
import { waterService } from '../services/water.service';

export const waterController = {
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const logs = await waterService.getLogs(userId);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getTodayProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await waterService.getTodayProgress(userId);
      res.status(200).json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { amount_ml } = req.body;
      
      if (!amount_ml || typeof amount_ml !== 'number') {
        res.status(400).json({ error: 'Falta campo requerido (amount_ml) o no es numérico' });
        return;
      }

      const newLog = await waterService.createLog(userId, amount_ml);
      res.status(201).json(newLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { amount_ml } = req.body;

      if (!amount_ml || typeof amount_ml !== 'number') {
        res.status(400).json({ error: 'Falta campo requerido (amount_ml) o no es numérico' });
        return;
      }

      const updatedLog = await waterService.updateLog(userId, id, amount_ml);
      res.status(200).json(updatedLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      await waterService.deleteLog(userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};