import { supabase } from '../config/supabase';
import { DailySummary } from '../types';

export const historyService = {
  async getDailySummary(userId: string, days: number): Promise<DailySummary[]> {
    const { data, error } = await supabase.rpc('get_daily_summary', {
      p_user_id: userId,
      p_days: days
    });

    if (error) {
      throw new Error(`Error fetching daily summary: ${error.message}`);
    }

    return (data ?? []).map((row: any) => ({
      date: row.out_date,
      total_calories: Number(row.out_total_calories) || 0,
      calorie_goal: Number(row.out_calorie_goal) || 2500,
      total_water: Number(row.out_total_water) || 0,
      water_goal: Number(row.out_water_goal) || 2000
    }));
  }
};
