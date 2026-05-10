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

      if (!Array.isArray(exercises) || exercises.length === 0) {
        res.status(400).json({ error: 'Falta campo requerido: exercises (array no vacío)' });
        return;
      }

      for (const ex of exercises) {
        if (!ex.name) {
          res.status(400).json({ error: 'Cada ejercicio debe tener name' });
          return;
        }
        if (!Array.isArray(ex.sets) || ex.sets.length === 0) {
          res.status(400).json({ error: `El ejercicio "${ex.name}" debe tener al menos una serie en sets` });
          return;
        }
        for (const set of ex.sets) {
          if (typeof set.reps !== 'number' || typeof set.weight_kg !== 'number') {
            res.status(400).json({ error: `Cada serie debe tener reps y weight_kg numéricos` });
            return;
          }
        }
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

  async getExerciseSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const suggestions = await workoutService.getExerciseSuggestions(userId);
      res.status(200).json(suggestions);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  async getWorkoutDetail(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const workoutId = req.params.id as string;

      const workout = await workoutService.getWorkoutById(userId, workoutId);

      if (!workout) {
        res.status(404).json({ error: 'Entrenamiento no encontrado' });
        return;
      }

      res.status(200).json(workout);
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
