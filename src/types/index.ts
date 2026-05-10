export interface Profile {
  id: string;
  username: string;
  full_name: string;
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fats_goal: number;
  water_goal: number;
  current_weight?: number;
  height?: number;
  age?: number;
  body_fat_percentage?: number;
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

export interface ExerciseSet {
  id?: string;
  exercise_id?: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  created_at?: string;
}

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  rpe: number;
  exercise_sets?: ExerciseSet[];
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

export interface DailySummary {
  date: string;
  total_calories: number;
  calorie_goal: number;
  total_water: number;
  water_goal: number;
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
