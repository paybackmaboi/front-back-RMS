import { Router } from 'express';
import { EnrollmentApplicationController } from '../controllers/enrollmentApplicationController';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

// Get all enrollment applications (filtered by role)
router.get('/', auth, EnrollmentApplicationController.getAllApplications);

// Get applications by status
router.get('/status/:status', auth, EnrollmentApplicationController.getApplicationsByStatus);

// Get single application
router.get('/:id', auth, EnrollmentApplicationController.getApplication);

// Create new application (from enrollment system) - Public endpoint for system integration
router.post('/', EnrollmentApplicationController.createApplication);

// Create new application (authenticated)
router.post('/auth', auth, EnrollmentApplicationController.createApplication);

// Accounting approval (payment verification)
router.patch('/:id/approve-payment', 
    auth, 
    authorize(['accounting', 'admin']), 
    EnrollmentApplicationController.approvePayment
);

// Admin review and approval (as registrar)
router.patch('/:id/review', 
    auth, 
    authorize(['admin']), 
    EnrollmentApplicationController.reviewByRegistrar
);

// Get dashboard statistics
router.get('/stats/dashboard', auth, EnrollmentApplicationController.getDashboardStats);

export default router;
