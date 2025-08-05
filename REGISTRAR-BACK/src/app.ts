import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

import cors from 'cors';
import path from 'path';
import { sequelize, connectAndInitialize } from './database';
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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.set('json spaces', 2);
// --- Global Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the project's root 'uploads' directory
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));


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

// --- Error Handling Middleware ---
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error("An error occurred:", err.message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ message: err.message || 'An internal server error occurred.' });
};

app.use(errorHandler);


const startServer = async () => {
    try {
        await connectAndInitialize();
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');

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
        console.log('Dummy student S001 created or already exists.');

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
        console.log('Dummy admin A001 created or exists.');

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
        console.log('Dummy accounting AC001 created or exists.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Unable to start the server:', err);
        process.exit(1);
    }
};

startServer();

export default app;