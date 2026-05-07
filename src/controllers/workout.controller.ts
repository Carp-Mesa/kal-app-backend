import { Request, Response } from 'express';
import { workoutService } from '../services/workout.service';

export const workoutController = {
  async createFullWorkout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, date, duration_mins, notes, exercises } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Falta campo requerido: name' });
        return;
      }

      // Validación estricta del formato de fecha (YYYY-MM-DD).
      // Se trata como string opaco: NO se convierte a Date para evitar desplazamiento UTC.
      const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
      if (date !== undefined && !DATE_REGEX.test(date)) {
        res.status(400).json({ error: 'El campo date debe tener formato YYYY-MM-DD' });
        return;
      }

      const workoutData = {
        name: String(name),
        date: date ?? null,           // null → la RPC usará la fecha de Colombia
        duration_mins: duration_mins ? Number(duration_mins) : 0,
        notes: notes ? String(notes) : undefined
      };

      const newWorkout = await workoutService.createFullWorkout(userId, workoutData, exercises);

      res.status(201).json({
        id: newWorkout.id,
        date: newWorkout.date,
        status: 'success'
      });
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
