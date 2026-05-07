import { supabase } from '../config/supabase';
import { Workout, Exercise } from '../types';

export const workoutService = {
  async createFullWorkout(userId: string, workoutData: Partial<Workout>, exercisesData: Partial<Exercise>[]): Promise<Workout> {
    
    // 1. Limpiar y estructurar el arreglo de ejercicios
    const formattedExercises = exercisesData?.map(ex => ({
      name: String(ex.name),
      sets: Number(ex.sets) || 0,
      reps: Number(ex.reps) || 0,
      weight_kg: Number(ex.weight_kg) || 0,
      rpe: Number(ex.rpe) || 0
    })) || [];

    // 2. Ejecutar la función RPC (Transacción 100% atómica de Postgres)
    const { data, error } = await supabase.rpc('create_workout_with_exercises', {
      p_user_id: userId, // Token-secure user_id
      p_name: workoutData.name,
      p_duration_mins: workoutData.duration_mins,
      p_date: workoutData.date || null,
      p_notes: workoutData.notes || null,
      p_exercises: formattedExercises
    });

    if (error) {
      throw new Error(`Error en Transacción RPC (Rollback automático aplicado por Postgres): ${error.message}`);
    }

    // 3. Devolver la respuesta mapeando el ID que devolvió SQL
    return {
      id: data.workout_id,
      user_id: userId,
      ...workoutData,
      exercises: formattedExercises as Exercise[]
    } as Workout;
  },

  async getUserWorkoutHistory(userId: string, limit: number, offset: number) {
    const { data, error, count } = await supabase
      .from('workouts')
      .select(
        `
        id,
        name,
        date,
        duration_mins,
        notes,
        created_at,
        exercises (
          id,
          name,
          sets,
          reps,
          weight_kg,
          rpe
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Error fetching workout history: ${error.message}`);

    return {
      data: data ?? [],
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        has_more: (count ?? 0) > offset + limit,
      },
    };
  },

  async getTodayProgress(userId: string) {
    // Obtenemos la fecha actual en formato YYYY-MM-DD ajustada a UTC-5
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 5);
    const todayDateStr = now.toISOString().split('T')[0]; // Ejemplo: '2026-05-04'

    const { data: logs, error } = await supabase
      .from('workouts')
      .select('duration_mins')
      .eq('user_id', userId)
      .eq('date', todayDateStr);

    if (error) throw new Error(`Error fetching workouts: ${error.message}`);

    const total_duration = logs?.reduce((sum, log) => sum + (log.duration_mins || 0), 0) || 0;
    const is_completed = logs && logs.length > 0;

    return {
      is_completed,
      workouts_count: logs?.length || 0,
      total_duration
    };
  }
};
