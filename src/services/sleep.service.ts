import { supabase } from '../config/supabase';
import { SleepLog } from '../types';

export const sleepService = {
  async getLogs(userId: string): Promise<SleepLog[]> {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(error.message);
    return data as SleepLog[];
  },

  async createSleepLog(userId: string, start_time: string, end_time: string, quality_score: number): Promise<SleepLog> {
    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start.getTime() >= end.getTime()) {
      throw new Error('start_time debe ser anterior a end_time');
    }

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert([{ user_id: userId, start_time, end_time, quality_score }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SleepLog;
  },

  async updateLog(userId: string, id: string, start_time?: string, end_time?: string, quality_score?: number): Promise<SleepLog> {
    const updateData: any = {};
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (quality_score !== undefined) updateData.quality_score = quality_score;

    const { data, error } = await supabase
      .from('sleep_logs')
      .update(updateData)
      .match({ id, user_id: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as SleepLog;
  },

  async deleteLog(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('sleep_logs')
      .delete()
      .match({ id, user_id: userId });

    if (error) throw new Error(error.message);
  },

  async getRecentSleep(userId: string, days: number) {
    const now = new Date();
    // Offset UTC-5 Colombia
    now.setUTCHours(now.getUTCHours() - 5);
    
    // Calcular el inicio de "hace X días" a medianoche local
    const targetDate = new Date(now);
    targetDate.setUTCDate(targetDate.getUTCDate() - days);
    targetDate.setUTCHours(0, 0, 0, 0);
    
    // Regresar al UTC absoluto para que la DB busque desde las 05:00 UTC
    targetDate.setUTCHours(targetDate.getUTCHours() + 5);

    const startIso = targetDate.toISOString();

    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startIso)
      .order('start_time', { ascending: false });

    if (error) throw new Error(`Error fetching sleep logs: ${error.message}`);

    const logs = data as SleepLog[];

    // Calcular duración enriqueciendo y mapeando los resultados
    const enrichedLogs = logs.map(log => {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const diffMs = end.getTime() - start.getTime();
      
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;

      return {
        ...log,
        duration: { 
            hours, 
            minutes, 
            total_minutes: diffMins 
        }
      };
    });

    return enrichedLogs;
  },

  async getTodaySleep(userId: string) {
    const now = new Date();
    // Offset UTC-5 Colombia
    now.setUTCHours(now.getUTCHours() - 5);
    
    // Ajustar a la medianoche local de HOY
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    todayStart.setUTCHours(todayStart.getUTCHours() + 5);
    const startIso = todayStart.toISOString();

    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    const endIso = todayEnd.toISOString();

    // El registro debe considerarse 'de hoy' si la fecha de fin (end_time) cae en el día actual
    const { data: log, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('end_time', startIso)
      .lt('end_time', endIso)
      .order('end_time', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching today sleep: ${error.message}`);
    }

    if (!log) {
      return null;
    }

    const start = new Date(log.start_time);
    const end = new Date(log.end_time);
    const diffMs = end.getTime() - start.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    return {
      ...log,
      duration: { hours, minutes, total_minutes: diffMins }
    };
  }
};
