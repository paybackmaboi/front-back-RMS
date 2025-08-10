import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface EnrollmentApplicationAttributes {
    id: number;
    studentId: number;
    courseId: number;
    academicYear: string;
    semester: string;
    
    // Enrollment Data (from enrollment system)
    enrollmentData: any; // JSON field containing all enrollment form data
    selectedSubjects: any[]; // JSON array of selected subjects
    
    // Workflow Status
    status: 'pending_payment' | 'payment_approved' | 'pending_registrar_review' | 'approved' | 'rejected';
    
    // Approval Information
    accountingApprovedBy?: number; // User ID of accounting staff
    accountingApprovedAt?: Date;
    registrarApprovedBy?: number; // User ID of registrar
    registrarApprovedAt?: Date;
    
    // Comments/Notes
    accountingNotes?: string;
    registrarNotes?: string;
    rejectionReason?: string;
    
    // Timestamps
    submittedAt: Date;
    updatedAt: Date;
}

interface EnrollmentApplicationCreationAttributes extends Optional<EnrollmentApplicationAttributes, 'id' | 'submittedAt' | 'updatedAt'> {}

export class EnrollmentApplication extends Model<EnrollmentApplicationAttributes, EnrollmentApplicationCreationAttributes> implements EnrollmentApplicationAttributes {
    public id!: number;
    public studentId!: number;
    public courseId!: number;
    public academicYear!: string;
    public semester!: string;
    public enrollmentData!: any;
    public selectedSubjects!: any[];
    public status!: 'pending_payment' | 'payment_approved' | 'pending_registrar_review' | 'approved' | 'rejected';
    public accountingApprovedBy?: number;
    public accountingApprovedAt?: Date;
    public registrarApprovedBy?: number;
    public registrarApprovedAt?: Date;
    public accountingNotes?: string;
    public registrarNotes?: string;
    public rejectionReason?: string;
    public submittedAt!: Date;
    public updatedAt!: Date;

    public readonly createdAt!: Date;
}

export const initEnrollmentApplication = (sequelize: Sequelize) => {
    EnrollmentApplication.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        courseId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        academicYear: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        semester: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        enrollmentData: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        selectedSubjects: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
        status: {
            type: DataTypes.ENUM('pending_payment', 'payment_approved', 'pending_registrar_review', 'approved', 'rejected'),
            defaultValue: 'pending_payment',
            allowNull: false,
        },
        accountingApprovedBy: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        accountingApprovedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        registrarApprovedBy: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        registrarApprovedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        accountingNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        registrarNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        submittedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'enrollment_applications',
        sequelize: sequelize,
    });
};
