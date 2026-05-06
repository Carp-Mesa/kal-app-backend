import { supabase } from '../config/supabase';

export const authService = {
  async refreshSession(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ 
      refresh_token: refreshToken 
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  }
};