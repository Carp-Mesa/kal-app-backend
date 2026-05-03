import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import nutritionRoutes from './routes/nutrition.routes';
import waterRoutes from './routes/water.routes';
import workoutRoutes from './routes/workout.routes';

// Cargar variables de entorno solo en desarrollo local
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Para ver logs de peticiones en la terminal

// Rutas de la API
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/workouts', workoutRoutes);

// Ruta de prueba (Heartbeat)
app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'online',
        message: 'Gains Station API operando desde Azure 🚀',
        timestamp: new Date().toISOString()
    });
});

// El puerto lo define Azure por variable de entorno, si no, usa el 8080
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});