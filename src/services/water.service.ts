import { supabase } from '../config/supabase';
import { WaterLog } from '../types';

export const waterService = {
  async getLogs(userId: string): Promise<WaterLog[]> {
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as WaterLog[];
  },

  async createLog(userId: string, amount_ml: number): Promise<WaterLog> {
    const { data, error } = await supabase
      .from('water_logs')
      .insert([{ user_id: userId, amount_ml }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as WaterLog;
  },

  async updateLog(userId: string, id: string, amount_ml: number): Promise<WaterLog> {
    const { data, error } = await supabase
      .from('water_logs')
      .update({ amount_ml })
      .match({ id, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as WaterLog;
  },

  async deleteLog(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .match({ id, user_id: userId });

    if (error) throw new Error(error.message);
  },

  async getTodayProgress(userId: string) {
    // 1. Obtener la meta de agua del perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('water_goal')
      .eq('id', userId) // En Supabase, la tabla profiles normalmente usa 'id' como la referencia a auth.users.id
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${profileError.message}`);
    }

    const goal_ml = profile?.water_goal || 2000; // 2L por defecto si no existe

    // 2. Definir los límites de tiempo para "hoy" (Ajustado manualmente para UTC-5 / Colombia)
    const now = new Date();
    // Extraer la hora local asumiendo un offset de -5 horas
    now.setUTCHours(now.getUTCHours() - 5);

    // Ajustar a la medianoche del usuario
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    // Devolver al UTC sumando las 5 horas para que en base de datos consulte desde las 5AM UTC
    todayStart.setUTCHours(todayStart.getUTCHours() + 5);

    const startIso = todayStart.toISOString();

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    const endIso = todayEnd.toISOString();

    // 3. Consultar todos los registros de hoy
    const { data: logs, error: logsError } = await supabase
      .from('water_logs')
      .select('amount_ml')
      .eq('user_id', userId)
      .gte('created_at', startIso)
      .lt('created_at', endIso);

    if (logsError) throw new Error(`Error fetching water logs: ${logsError.message}`);

    // 4. Calcular el progreso
    const total_ml = logs?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;
    const percentage = Math.round((total_ml / goal_ml) * 100);

    return {
      total_ml,
      goal_ml,
      percentage: percentage > 100 ? 100 : percentage // Limitar al 100% visualmente
    };
  }
};