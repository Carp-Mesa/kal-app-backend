import { supabase } from '../config/supabase';
import { Profile } from '../types';

export const profileService = {
  async updateProfile(userId: string, profileData: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }

    return data;
  },

  async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // PGRST116 = no rows found (not a real error, just empty profile)
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${error.message}`);
    }

    return data ?? null;
  }
};
