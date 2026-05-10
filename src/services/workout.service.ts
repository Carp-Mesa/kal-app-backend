import { supabase } from '../config/supabase';
import { Workout, Exercise } from '../types';

interface ExerciseInput {
  name: string;
  rpe: number;
  sets: { reps: number; weight_kg: number }[];
}

export const workoutService = {
  async createFullWorkout(userId: string, workoutData: Partial<Workout>, exercisesData: ExerciseInput[]): Promise<Workout> {

    const formattedExercises = exercisesData?.map(ex => ({
      name: String(ex.name),
      rpe: Number(ex.rpe) || 0,
      sets: (ex.sets || []).map((s: { reps: number; weight_kg: number }) => ({
        reps: Number(s.reps) || 0,
        weight_kg: Number(s.weight_kg) || 0
      }))
    })) || [];

    const { data, error } = await supabase.rpc('create_workout_with_exercises', {
      p_user_id: userId,
      p_name: workoutData.name,
      p_duration_mins: workoutData.duration_mins,
      p_date: workoutData.date || null,
      p_notes: workoutData.notes || null,
      p_exercises: formattedExercises
    });

    if (error) {
      throw new Error(`Error en Transacción RPC (Rollback automático aplicado por Postgres): ${error.message}`);
    }

    return {
      id: data.workout_id,
      user_id: userId,
      ...workoutData,
      exercises: formattedExercises as unknown as Exercise[]
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
        exercises (
          id,
          name,
          rpe,
          exercise_sets (
            id,
            set_number,
            reps,
            weight_kg
          )
        )
        `,
        { count: 'exact' }
      )
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Error fetching workout history: ${error.message}`);

    const mapped = (data ?? []).map((workout: any) => ({
      ...workout,
      exercises: workout.exercises?.map((ex: any) => ({
        ...ex,
        sets: ex.exercise_sets
      })) ?? []
    }));

    return {
      data: mapped,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        has_more: (count ?? 0) > offset + limit,
      },
    };
  },

  async getWorkoutById(userId: string, workoutId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        id,
        name,
        date,
        duration_mins,
        notes,
        exercises (
          id,
          name,
          rpe,
          exercise_sets (
            id,
            set_number,
            reps,
            weight_kg
          )
        )
      `)
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching workout detail: ${error.message}`);
    }

    return {
      ...data,
      exercises: data.exercises?.map(({ exercise_sets, ...rest }) => ({
        ...rest,
        sets: exercise_sets
      })) ?? []
    };
  },

  async getExerciseSuggestions(userId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc('get_exercise_suggestions', {
      p_user_id: userId
    });

    if (error) {
      throw new Error(`Error fetching exercise suggestions: ${error.message}`);
    }

    return (data ?? []).map((row: any) => row.name);
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
