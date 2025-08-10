import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import cors from 'cors';
import path from 'path';
import { sequelize, connectAndInitialize } from './database';

// Minimal logging configuration to reduce terminal flickering
const logger = {
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  info: (message: string, ...args: any[]) => {}, // Silent for info messages
  success: (message: string, ...args: any[]) => {}, // Silent for success messages
  warn: (message: string, ...args: any[]) => {} // Silent for warning messages
};
import authRoutes from './routes/authRoutes';
import requestRoutes from './routes/requestRoutes';
import studentRoutes from './routes/studentRoutes';
import accountRoutes from './routes/accountRoutes';
import notificationRoutes from './routes/notificationRoutes';
// Import the new registration routes
import registrationRoutes from './routes/registrationRoutes';
// Import new routes for enrollment and subject management
import enrollmentRoutes from './routes/enrollmentRoutes';
import subjectRoutes from './routes/subjectRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import courseRoutes from './routes/courseRoutes';
import enrollmentApplicationRoutes from './routes/enrollmentApplicationRoutes';




const app = express();
const PORT = process.env.PORT || 5001;
app.set('json spaces', 2);
// --- Global Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the project's root 'uploads' directory
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        service: 'RMS Backend',
        timestamp: new Date().toISOString(),
        database: sequelize ? 'Connected' : 'Not Connected'
    });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/notifications', notificationRoutes);
// Add the new registration route
app.use('/api/register', registrationRoutes);
// Add new routes for enrollment and subject management
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollment-applications', enrollmentApplicationRoutes);

// --- Error Handling Middleware ---
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error("An error occurred:", err.message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: err.message || 'An internal server error occurred.' });
};

app.use(errorHandler);


const startServer = async () => {
    try {
        // Try to connect to database, but don't fail if it doesn't work
        try {
            await connectAndInitialize();
            await sequelize.sync({ alter: true });
            logger.success('Database synchronized successfully');

            const { User } = require('./database');

            // Seeding dummy accounts if they don't exist
            await User.findOrCreate({
                where: { idNumber: 'S001' },
                defaults: {
                    idNumber: 'S001',
                    password: 'password',
                    role: 'student',
                    firstName: 'Juan',
                    lastName: 'Dela Cruz'
                }
            });

            await User.findOrCreate({
                where: { idNumber: 'A001' },
                defaults: {
                    idNumber: 'A001',
                    password: 'adminpass',
                    role: 'admin',
                    firstName: 'Admin',
                    lastName: 'User'
                }
            });

            await User.findOrCreate({
                where: { idNumber: 'AC001' },
                defaults: {
                    idNumber: 'AC001',
                    password: 'accountingpass',
                    role: 'accounting',
                    firstName: 'Accounting',
                    lastName: 'User'
                }
            });
            logger.success('Dummy accounts ready');
        } catch (dbError: any) {
            logger.warn('Database connection failed, but server will start');
        }

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Health check: http://localhost:${PORT}/api/health`);
        });

    } catch (err) {
        logger.error('Unable to start the server:', err);
        process.exit(1);
    }
};

startServer();

export default app;