import { Request, Response } from 'express';
import { profileService } from '../services/profile.service';

export const profileController = {
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfileByUserId(userId);

      if (!profile) {
        res.status(404).json({ error: 'Perfil no encontrado para este usuario.' });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      console.error('[Profile Controller] getProfile error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profileData = req.body;

      // Prevent updating the user ID explicitly
      if (profileData.id) {
        delete profileData.id;
      }

      // Convert current_weight to number if it's sent as a string
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
  }
};
