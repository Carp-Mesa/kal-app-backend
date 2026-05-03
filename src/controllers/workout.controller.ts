import { Request, Response } from 'express';
import { workoutService } from '../services/workout.service';

export const workoutController = {
  async createFullWorkout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, duration_mins, notes, exercises } = req.body;

      // Validación básica
      if (!name) {
        res.status(400).json({ error: 'Falta campo requerido: name' });
        return;
      }

      // Aseguramos el tipado numérico en la capa del controlador (seguridad extra)
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
  }
};