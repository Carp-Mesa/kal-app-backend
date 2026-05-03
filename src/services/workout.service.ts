import { supabase } from '../config/supabase';
import { Workout, Exercise } from '../types';

export const workoutService = {
  async createFullWorkout(userId: string, workoutData: Partial<Workout>, exercisesData: Partial<Exercise>[]): Promise<Workout> {
    // 1. Insertar el Workout (Padre)
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert([{
        user_id: userId,
        name: workoutData.name,
        duration_mins: workoutData.duration_mins,
        notes: workoutData.notes
        // date se asume autogenerado o mapeado según la bd
      }])
      .select()
      .single();

    if (workoutError || !workout) {
      throw new Error(`Error creando el entrenamiento: ${workoutError?.message}`);
    }

    // Si no hay ejercicios, devolvemos el workout vacío
    if (!exercisesData || exercisesData.length === 0) {
      return { ...workout, exercises: [] } as Workout;
    }

    // 2. Preparar el array de ejercicios inyectando el workout_id generado (y forzando Numbers)
    const formattedExercises = exercisesData.map(ex => ({
      workout_id: workout.id, // El ID generado e inyectado
      name: ex.name,
      sets: Number(ex.sets) || 0,
      reps: Number(ex.reps) || 0,
      weight_kg: Number(ex.weight_kg) || 0,
      rpe: Number(ex.rpe) || 0
    }));

    // 3. Insertar los ejercicios (Hijos)
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .insert(formattedExercises)
      .select();

    // 4. Manejo manual de rollback (Pseudo-Transaccional en caso de fallo)
    if (exercisesError) {
      // Intentar borrar el workout padre para mantener la consistencia
      await supabase.from('workouts').delete().eq('id', workout.id);
      throw new Error(`Error guardando ejercicios, el entrenamiento fue revertido (Rollback): ${exercisesError.message}`);
    }

    // Retornamos el objeto compuesto
    return {
      ...workout,
      exercises: exercises as Exercise[]
    } as Workout;
  }
};