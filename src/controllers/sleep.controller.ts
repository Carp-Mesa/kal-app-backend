import { Request, Response } from 'express';
import { sleepService } from '../services/sleep.service';

export const sleepController = {
  async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const logs = await sleepService.getLogs(userId);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRecent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const days = parseInt(req.query.days as string) || 7; // Por defecto últimos 7 días
      const recent = await sleepService.getRecentSleep(userId, days);
      res.status(200).json(recent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async createSleepLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { start_time, end_time, quality_score } = req.body;

      if (!start_time || !end_time || quality_score === undefined) {
        res.status(400).json({ error: 'Faltan campos requeridos (start_time, end_time, quality_score)' });
        return;
      }

      const newLog = await sleepService.createSleepLog(userId, start_time, end_time, Number(quality_score));
      res.status(201).json(newLog);
    } catch (error: any) {
      if (error.message === 'start_time debe ser anterior a end_time') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { start_time, end_time, quality_score } = req.body;

      if (start_time && end_time) {
        if (new Date(start_time).getTime() >= new Date(end_time).getTime()) {
          res.status(400).json({ error: 'start_time debe ser anterior a end_time' });
          return;
        }
      }

      const updatedLog = await sleepService.updateLog(
        userId, 
        id, 
        start_time ? new Date(start_time).toISOString() : undefined, 
        end_time ? new Date(end_time).toISOString() : undefined, 
        quality_score !== undefined ? Number(quality_score) : undefined
      );

      res.status(200).json(updatedLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;

      await sleepService.deleteLog(userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
  async getSleepProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await sleepService.getTodaySleep(userId);
      res.status(200).json(progress);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};
