import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Faltan campos requeridos: email y password' });
        return;
      }

      // Validar credenciales directamente con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        res.status(401).json({ error: error.message });
        return;
      }

      // Devolver el token y la información del usuario al cliente frontal
      res.status(200).json({
        message: 'Login exitoso',
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role
        }
      });
    } catch (error: any) {
      console.error('Error en el login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};