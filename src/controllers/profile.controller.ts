import { Request, Response } from 'express';
import { z } from 'zod';
import { profileService } from '../services/profile.service';

const updateGoalsSchema = z.object({
  calorie_goal: z.number().int().nonnegative().optional(),
  protein_goal: z.number().int().nonnegative().optional(),
  carbs_goal: z.number().int().nonnegative().optional(),
  fats_goal: z.number().int().nonnegative().optional(),
  water_goal: z.number().int().nonnegative().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un objetivo para actualizar',
});

export const profileController = {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfileByUserId(userId);

      if (!profile) {
        res.status(404).json({ error: 'Perfil no encontrado para este usuario.' });
        return;
      }

      res.status(200).json({
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name ?? '',
        avatar_url: profile.avatar_url ?? '',
        calorie_goal: profile.calorie_goal ?? 0,
        protein_goal: profile.protein_goal ?? 0,
        carbs_goal: profile.carbs_goal ?? 0,
        fats_goal: profile.fats_goal ?? 0,
        water_goal: profile.water_goal ?? 0,
        current_weight: profile.current_weight ?? null,
        height: profile.height ?? null,
        age: profile.age ?? null,
        body_fat_percentage: profile.body_fat_percentage ?? null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      });
    } catch (error: any) {
      console.error('[Profile Controller] getProfile error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profileData = req.body;

      if (profileData.id) {
        delete profileData.id;
      }

      if (profileData.current_weight !== undefined && profileData.current_weight !== null) {
        const parsedWeight = parseFloat(profileData.current_weight);
        if (!isNaN(parsedWeight)) {
          profileData.current_weight = parsedWeight;
        } else {
          res.status(400).json({ error: 'current_weight debe ser un número válido' });
          return;
        }
      }

      const updatedProfile = await profileService.updateProfile(userId, profileData);
      
      res.status(200).json(updatedProfile);
    } catch (error: any) {
      console.error('[Profile Controller Error]:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  async updateGoals(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const parsed = updateGoalsSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: 'Datos inválidos',
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const updatedProfile = await profileService.updateGoals(userId, parsed.data);
      res.status(200).json(updatedProfile);
    } catch (error: any) {
      console.error('[Profile Controller] updateGoals error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
};
