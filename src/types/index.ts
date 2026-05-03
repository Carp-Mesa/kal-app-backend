export interface Profile {
  id: string; // UUID
  user_id: string; // UUID from Supabase Auth
  username: string;
  full_name: string;
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fats_goal: number;
  water_goal: number;
  created_at?: string;
  updated_at?: string;
}

export interface NutritionLog {
  id: string; // UUID
  user_id: string; // UUID
  meal_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
}

export interface WaterLog {
  id: string; // UUID
  user_id: string; // UUID
  amount_ml: number;
  created_at?: string;
}

export interface Workout {
  id: string; // UUID
  user_id: string; // UUID
  name: string; // Ej: "Push Day"
  duration_mins: number;
  date?: string;
  notes?: string;
  created_at?: string;
  exercises?: Exercise[]; // Relación incluída
}

export interface Exercise {
  id: string; // UUID
  workout_id: string; // UUID (Foreign Key to Workouts)
  name: string;
  rpe: number;
  weight_kg: number; // Actualizado de weights a weight_kg
  reps: number;
  sets: number;
  created_at?: string;
}

export interface SleepLog {
  id: string; // UUID
  user_id: string; // UUID
  start_time: string; // ISO String or Time
  end_time: string; // ISO String or Time
  quality_score: number; // e.g., 1-10
  created_at?: string;
}

export interface ReminderConfig {
  id: string; // UUID
  user_id: string; // UUID
  frequency: string | number; // e.g., "every 2 hours" or 120 (minutes)
  start_hour: string; // e.g., "08:00"
  end_hour: string; // e.g., "22:00"
  created_at?: string;
  updated_at?: string;
}
