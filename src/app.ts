import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Cargar variables de entorno solo en desarrollo local
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Para ver logs de peticiones en la terminal

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