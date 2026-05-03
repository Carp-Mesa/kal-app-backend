import { supabase } from '../config/supabase';
import { NutritionLog } from '../types';

export const nutritionService = {
  async getLogs(userId: string): Promise<NutritionLog[]> {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as NutritionLog[];
  },

  async createLog(userId: string, log: Omit<NutritionLog, 'id' | 'user_id' | 'created_at'>): Promise<NutritionLog> {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert([{ ...log, user_id: userId }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as NutritionLog;
  },

  async updateLog(userId: string, id: string, log: Partial<Omit<NutritionLog, 'id' | 'user_id' | 'created_at'>>): Promise<NutritionLog> {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .update(log)
      .match({ id, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as NutritionLog;
  },

  async deleteLog(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .match({ id, user_id: userId });

    if (error) throw new Error(error.message);
  },

  async getDailyProgress(userId: string) {
    // 1. Obtener las metas de nutrición del perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('calorie_goal, protein_goal, carbs_goal, fats_goal')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${profileError.message}`);
    }

    // Valores por defecto
    const goals = {
      calories: Number(profile?.calorie_goal) || 2500,
      protein: Number(profile?.protein_goal) || 150,
      carbs: Number(profile?.carbs_goal) || 300,
      fats: Number(profile?.fats_goal) || 70
    };

    // 2. Definir los límites de tiempo para "hoy" (Ajustado manual a UTC-5 / Colombia)
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 5);

    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    todayStart.setUTCHours(todayStart.getUTCHours() + 5);

    const startIso = todayStart.toISOString();

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    const endIso = todayEnd.toISOString();

    // 3. Consultar todos los registros de hoy
    const { data: logs, error: logsError } = await supabase
      .from('nutrition_logs')
      .select('calories, protein, carbs, fats')
      .eq('user_id', userId)
      .gte('created_at', startIso)
      .lt('created_at', endIso);

    if (logsError) throw new Error(`Error fetching nutrition logs: ${logsError.message}`);

    // 4. Calcular el progreso total
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

    if (logs) {
      logs.forEach(log => {
        totalCalories += Number(log.calories) || 0;
        totalProtein += Number(log.protein) || 0;
        totalCarbs += Number(log.carbs) || 0;
        totalFats += Number(log.fats) || 0;
      });
    }

    // Helper para porcentaje visual
    const calcPercent = (val: number, goal: number) => {
      const p = Math.round((val / goal) * 100);
      return p > 100 ? 100 : p;
    };

    return {
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats
      },
      goals,
      percentages: {
        calories: calcPercent(totalCalories, goals.calories),
        protein: calcPercent(totalProtein, goals.protein),
        carbs: calcPercent(totalCarbs, goals.carbs),
        fats: calcPercent(totalFats, goals.fats)
      }
    };
  }
};