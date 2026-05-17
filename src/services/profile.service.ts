import { supabase } from '../config/supabase';
import { Profile } from '../types';

export type GoalsUpdate = Partial<Pick<Profile, 'calorie_goal' | 'protein_goal' | 'carbs_goal' | 'fats_goal' | 'water_goal'>>;

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

  async updateGoals(userId: string, goals: GoalsUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(goals)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating goals: ${error.message}`);
    }

    return data;
  },

  async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching profile: ${error.message}`);
    }

    return data ?? null;
  }
};
