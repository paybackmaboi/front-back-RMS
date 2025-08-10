import { Request, Response } from 'express';
import { EnrollmentApplication } from '../models/EnrollmentApplication';
import { Student } from '../models/Student';
import { Course } from '../models/Course';
import { User } from '../models/User';

export class EnrollmentApplicationController {
    // Get all enrollment applications (filtered by status and role)
    static async getAllApplications(req: Request, res: Response): Promise<void> {
        try {
            const { status, role } = req.query;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            let whereClause: any = {};
            
            // Filter by status if provided
            if (status) {
                whereClause.status = status;
            }

            // Role-based filtering
            if (userRole === 'accounting') {
                whereClause.status = ['pending_payment', 'payment_approved'];
            } else if (userRole === 'admin') {
                whereClause.status = ['pending_registrar_review', 'approved', 'rejected'];
            }

            const applications = await EnrollmentApplication.findAll({
                where: whereClause,
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'fullName', 'studentNumber', 'email', 'contactNumber']
                    },
                    {
                        model: Course,
                        as: 'course',
                        attributes: ['id', 'courseName', 'courseCode']
                    }
                ],
                order: [['submittedAt', 'DESC']]
            });

            res.json(applications);
        } catch (error) {
            console.error('Error fetching enrollment applications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get single enrollment application
    static async getApplication(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            const application = await EnrollmentApplication.findByPk(id, {
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'fullName', 'studentNumber', 'email', 'contactNumber', 'courseId']
                    },
                    {
                        model: Course,
                        as: 'course',
                        attributes: ['id', 'courseName', 'courseCode']
                    }
                ]
            });

            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error fetching enrollment application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Create new enrollment application (from enrollment system)
    static async createApplication(req: Request, res: Response): Promise<void> {
        try {
            console.log('Received enrollment application data:', req.body);
            
            const {
                studentId,
                courseId,
                academicYear,
                semester,
                enrollmentData,
                selectedSubjects
            } = req.body;

            // Create a student record if it doesn't exist
            let student = await Student.findOne({ where: { studentNumber: enrollmentData?.studentId } });
            
            if (!student) {
                // Create a default user first
                const defaultUser = await User.create({
                    idNumber: enrollmentData?.studentId || `STU-${Date.now()}`,
                    password: 'defaultpassword123',
                    role: 'student',
                    firstName: enrollmentData?.fullName?.split(' ')[0] || 'Student',
                    lastName: enrollmentData?.fullName?.split(' ').slice(1).join(' ') || 'User',
                    email: enrollmentData?.email || 'student@university.edu',
                    phoneNumber: enrollmentData?.contactNumber || '',
                    isActive: true
                });

                // Create new student record
                student = await Student.create({
                    userId: defaultUser.id,
                    courseId: courseId,
                    studentNumber: enrollmentData?.studentId || `STU-${Date.now()}`,
                    fullName: enrollmentData?.fullName || 'Unknown Student',
                    email: enrollmentData?.email || 'student@university.edu',
                    contactNumber: enrollmentData?.contactNumber || '',
                    gender: enrollmentData?.gender || 'Unknown',
                    dateOfBirth: enrollmentData?.birthDate ? new Date(enrollmentData.birthDate) : new Date(),
                    placeOfBirth: enrollmentData?.birthPlace || '',
                    maritalStatus: enrollmentData?.maritalStatus || 'Single',
                    religion: enrollmentData?.religion || '',
                    citizenship: enrollmentData?.citizenship || 'Filipino',
                    country: enrollmentData?.country || 'Philippines',
                    cityAddress: enrollmentData?.cityAddress || '',
                    provincialAddress: enrollmentData?.provincialAddress || '',
                    fatherName: enrollmentData?.fatherName || '',
                    fatherAddress: enrollmentData?.cityAddress || '',
                    fatherOccupation: enrollmentData?.fatherOccupation || '',
                    fatherCompany: enrollmentData?.fatherCompany || '',
                    fatherContactNumber: enrollmentData?.fatherContact || '',
                    fatherIncome: enrollmentData?.fatherIncome || '',
                    motherName: enrollmentData?.motherName || '',
                    motherAddress: enrollmentData?.cityAddress || '',
                    motherOccupation: enrollmentData?.motherOccupation || '',
                    motherCompany: enrollmentData?.motherCompany || '',
                    motherContactNumber: enrollmentData?.motherContact || '',
                    motherIncome: enrollmentData?.motherIncome || '',
                    guardianName: enrollmentData?.guardianName || '',
                    guardianAddress: enrollmentData?.cityAddress || '',
                    guardianOccupation: enrollmentData?.guardianOccupation || '',
                    guardianCompany: enrollmentData?.guardianCompany || '',
                    guardianContactNumber: enrollmentData?.guardianContact || '',
                    guardianIncome: enrollmentData?.guardianIncome || '',
                    major: enrollmentData?.major || '',
                    studentType: enrollmentData?.studentType || 'First',
                    semesterEntry: enrollmentData?.semester || 'First',
                    yearOfEntry: enrollmentData?.yearOfEntry || new Date().getFullYear(),
                    applicationType: enrollmentData?.applicationType || 'Freshmen',
                    elementarySchool: enrollmentData?.elementarySchool || '',
                    elementaryAddress: enrollmentData?.elementarySchool || '',
                    elementaryYearGraduated: enrollmentData?.elementaryGraduation || new Date().getFullYear(),
                    juniorHighSchool: enrollmentData?.jhsSchool || '',
                    juniorHighAddress: enrollmentData?.jhsSchool || '',
                    juniorHighYearGraduated: enrollmentData?.jhsGraduation || new Date().getFullYear(),
                    seniorHighSchool: enrollmentData?.shsSchool || '',
                    seniorHighAddress: enrollmentData?.shsSchool || '',
                    seniorHighYearGraduated: enrollmentData?.shsGraduation || new Date().getFullYear(),
                    academicStatus: 'Regular',
                    currentYearLevel: 1,
                    currentSemester: 1,
                    totalUnitsEarned: 0,
                    cumulativeGPA: 0,
                    isActive: true
                });
                console.log('Created new student:', student.id);
            }

            // Create the enrollment application
            const application = await EnrollmentApplication.create({
                studentId: student.id,
                courseId: courseId,
                academicYear: academicYear || '2025-2026',
                semester: semester || '1st Semester',
                enrollmentData: enrollmentData,
                selectedSubjects: selectedSubjects,
                status: 'pending_payment'
            });

            console.log('Created enrollment application:', application.id);
            res.status(201).json(application);
        } catch (error) {
            console.error('Error creating enrollment application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Accounting approval (payment verification)
    static async approvePayment(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { notes } = req.body;
            const userId = req.user?.id;

            const application = await EnrollmentApplication.findByPk(id);
            
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            if (application.status !== 'pending_payment') {
                res.status(400).json({ error: 'Application is not in pending payment status' });
                return;
            }

            await application.update({
                status: 'payment_approved',
                accountingApprovedBy: userId,
                accountingApprovedAt: new Date(),
                accountingNotes: notes
            });

            res.json(application);
        } catch (error) {
            console.error('Error approving payment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Admin review and approval (as registrar)
    static async reviewByRegistrar(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { action, notes, rejectionReason } = req.body;
            const userId = req.user?.id;

            const application = await EnrollmentApplication.findByPk(id);
            
            if (!application) {
                res.status(404).json({ error: 'Application not found' });
                return;
            }

            if (application.status !== 'payment_approved') {
                res.status(400).json({ error: 'Application is not ready for registrar review' });
                return;
            }

            if (action === 'approve') {
                await application.update({
                    status: 'approved',
                    registrarApprovedBy: userId,
                    registrarApprovedAt: new Date(),
                    registrarNotes: notes
                });
            } else if (action === 'reject') {
                await application.update({
                    status: 'rejected',
                    registrarApprovedBy: userId,
                    registrarApprovedAt: new Date(),
                    registrarNotes: notes,
                    rejectionReason
                });
            } else {
                res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
                return;
            }

            res.json(application);
        } catch (error) {
            console.error('Error reviewing application:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get applications by status for different roles
    static async getApplicationsByStatus(req: Request, res: Response): Promise<void> {
        try {
            const { status } = req.params;
            const userRole = req.user?.role;

            let validStatuses: string[] = [];
            
            if (userRole === 'accounting') {
                validStatuses = ['pending_payment', 'payment_approved'];
            } else if (userRole === 'admin') {
                validStatuses = ['pending_registrar_review', 'approved', 'rejected'];
            }

            if (status && !validStatuses.includes(status)) {
                res.status(403).json({ error: 'Access denied for this status' });
                return;
            }

            const whereClause = status ? { status } : {};

            const applications = await EnrollmentApplication.findAll({
                where: whereClause,
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'fullName', 'studentNumber', 'email', 'contactNumber']
                    },
                    {
                        model: Course,
                        as: 'course',
                        attributes: ['id', 'courseName', 'courseCode']
                    }
                ],
                order: [['submittedAt', 'DESC']]
            });

            res.json(applications);
        } catch (error) {
            console.error('Error fetching applications by status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const userRole = req.user?.role;

            let whereClause: any = {};
            
            if (userRole === 'accounting') {
                whereClause.status = ['pending_payment', 'payment_approved'];
            } else if (userRole === 'admin') {
                whereClause.status = ['pending_registrar_review', 'approved', 'rejected'];
            }

            const stats = await EnrollmentApplication.findAll({
                where: whereClause,
                attributes: [
                    'status',
                    [EnrollmentApplication.sequelize!.fn('COUNT', EnrollmentApplication.sequelize!.col('id')), 'count']
                ],
                group: ['status']
            });

            res.json(stats);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
