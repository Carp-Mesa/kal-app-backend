// Preparando el terreno para la lógica de notificaciones
// Interaccionará con webhooks, websockets o Cron Jobs para alertar al Kiosk
import { supabase } from '../config/supabase';
import { ReminderConfig } from '../types';

export const reminderService = {
  /**
   * Obtiene la configuración actual de recordatorios del usuario
   */
  async getConfig(userId: string): Promise<ReminderConfig | null> {
    const { data, error } = await supabase
      .from('reminders_config')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore row not found error
      throw new Error(error.message);
    }
    
    return data as ReminderConfig | null;
  },

  /**
   * Función placeholder: Se utilizará en el futuro para encolar o disparar
   * la notificación push / socket hacia el dispositivo Samsung
   */
  async dispatchReminder(userId: string, type: 'water' | 'workout' | 'nutrition') {
    console.log(`[Reminder Service] Dispatching ${type} reminder for user ${userId}`);
    // TODO: Implementar lógica de PUSH API / Socket.io
  }
};