import { Request, Response } from 'express';
import { workoutService } from '../services/workout.service';

export const workoutController = {
  async createFullWorkout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, duration_mins, notes, exercises } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Falta campo requerido: name' });
        return;
      }

      const workoutData = {
        name: String(name),
        duration_mins: duration_mins ? Number(duration_mins) : 0,
        notes: notes ? String(notes) : undefined
      };

      const newWorkout = await workoutService.createFullWorkout(userId, workoutData, exercises);
      res.status(201).json(newWorkout);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await workoutService.getUserWorkoutHistory(userId, limit, offset);
      res.status(200).json(result);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  async getTodayProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await workoutService.getTodayProgress(userId);
      res.status(200).json(progress);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};
