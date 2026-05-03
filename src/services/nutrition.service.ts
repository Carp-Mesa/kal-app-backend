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
  }
};