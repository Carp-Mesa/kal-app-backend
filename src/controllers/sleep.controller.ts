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

  async createLog(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { start_time, end_time, quality_score } = req.body;

      if (!start_time || !end_time || quality_score === undefined) {
        res.status(400).json({ error: 'Faltan campos requeridos (start_time, end_time, quality_score)' });
        return;
      }

      const start = new Date(start_time);
      const end = new Date(end_time);

      // Validación del viaje en el tiempo
      if (start.getTime() >= end.getTime()) {
        res.status(400).json({ error: 'start_time debe ser estrictamente anterior a end_time' });
        return;
      }

      const score = Number(quality_score);

      const newLog = await sleepService.createLog(userId, start.toISOString(), end.toISOString(), score);
      res.status(201).json(newLog);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
  async getTodayProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await sleepService.getTodayProgress(userId);
      res.status(200).json(progress);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};
