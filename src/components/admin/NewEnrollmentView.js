import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';
import CustomAlert from '../../CustomAlert';

function NewEnrollmentView({ student, onCompleteEnrollment, registrations, setStudentToEnroll }) {
    const [step, setStep] = useState(1);
    const [enlistedSubjects, setEnlistedSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    const [newStudentInfo, setNewStudentInfo] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        gender: 'Male',
        course: 'BSIT'
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: null });
    const [createdStudentData, setCreatedStudentData] = useState(null);

    // Helper function to get subjects for enrollment
    const getSubjectsForEnrollment = (course, yearLevel, semester) => {
        // This is a placeholder function - in a real app, this would fetch from API
        const subjectsMap = {
            'BSIT': [
                { code: 'IT101', description: 'Introduction to Information Technology', units: 3, days: 'MWF', schedule: '8:00-9:30', room: 'Room 101' },
                { code: 'IT102', description: 'Programming Fundamentals', units: 3, days: 'TTH', schedule: '10:00-11:30', room: 'Room 102' },
                { code: 'IT103', description: 'Computer Hardware Fundamentals', units: 3, days: 'MWF', schedule: '1:00-2:30', room: 'Room 103' },
                { code: 'IT104', description: 'Web Development Basics', units: 3, days: 'TTH', schedule: '3:00-4:30', room: 'Room 104' }
            ],
            'BSCS': [
                { code: 'CS101', description: 'Introduction to Computer Science', units: 3, days: 'MWF', schedule: '8:00-9:30', room: 'Room 201' },
                { code: 'CS102', description: 'Data Structures', units: 3, days: 'TTH', schedule: '10:00-11:30', room: 'Room 202' },
                { code: 'CS103', description: 'Algorithms', units: 3, days: 'MWF', schedule: '1:00-2:30', room: 'Room 203' }
            ],
            'BSBA-HRDM': [
                { code: 'HR101', description: 'Introduction to Human Resource Management', units: 3, days: 'MWF', schedule: '8:00-9:30', room: 'Room 301' },
                { code: 'HR102', description: 'Organizational Behavior', units: 3, days: 'TTH', schedule: '10:00-11:30', room: 'Room 302' }
            ],
            'BSED-EN': [
                { code: 'EN101', description: 'English Grammar and Composition', units: 3, days: 'MWF', schedule: '8:00-9:30', room: 'Room 401' },
                { code: 'EN102', description: 'Literature Survey', units: 3, days: 'TTH', schedule: '10:00-11:30', room: 'Room 402' }
            ],
            'BS-ARCH': [
                { code: 'AR101', description: 'Introduction to Architecture', units: 3, days: 'MWF', schedule: '8:00-9:30', room: 'Room 501' },
                { code: 'AR102', description: 'Architectural Drawing', units: 3, days: 'TTH', schedule: '10:00-11:30', room: 'Room 502' }
            ]
        };
        
        return subjectsMap[course] || [];
    };

    useEffect(() => {
        if (student) {
            setStep(1);
            // Automatically load the prescribed subjects for the student's course
            // In a real app, you would also pass year level and semester
            const subjectsToEnlist = getSubjectsForEnrollment(student.course, '1st Year', '1st Semester');
            setEnlistedSubjects(subjectsToEnlist);
        } else {
            // If no student is selected (e.g., walk-in), clear the subjects
            setEnlistedSubjects([]);
        }
    }, [student]);

    const handleSearch = () => {
        if (!isAdmin || !searchTerm) return;
        const foundStudent = registrations.find(
            reg => reg.regNo === searchTerm && reg.status === 'approved'
        );
        if (foundStudent) {
            setStudentToEnroll(foundStudent);
        } else {
            setModalContent({ 
                title: 'Search Failed', 
                body: (
                    <div className="text-center">
                        <div className="mb-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-search text-warning fa-2x"></i>
                            </div>
                            <h5 className="text-warning fw-bold mb-1">Registration Not Found</h5>
                            <p className="text-muted mb-0 small">No approved registration found.</p>
                        </div>
                        
                        <div className="alert alert-warning border-0 shadow-sm py-2 mb-3">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-exclamation-triangle text-warning me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Search Details</h6>
                                    <p className="mb-0 small">Registration: <span className="fw-bold">{searchTerm}</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="alert alert-info border-0 shadow-sm py-2 mb-3">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-lightbulb text-info me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Possible Reasons</h6>
                                    <ul className="mb-0 text-start small">
                                        <li>Registration number incorrect</li>
                                        <li>Registration not approved yet</li>
                                        <li>Student doesn't exist</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2 justify-content-center">
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setSearchTerm('')}
                            >
                                <i className="fas fa-search me-1"></i>
                                Try Again
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setIsModalOpen(false);
                                }}
                            >
                                <i className="fas fa-user-plus me-1"></i>
                                Create New
                            </button>
                        </div>
                    </div>
                ) 
            });
            setIsModalOpen(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudentInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAndEnroll = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const { lastName, firstName, course } = newStudentInfo;
        if (!lastName || !firstName || !course) {
            setModalContent({ 
                title: 'Missing Information', 
                body: (
                    <div className="text-center">
                        <div className="mb-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-exclamation-circle text-warning fa-2x"></i>
                            </div>
                            <h5 className="text-warning fw-bold mb-1">Missing Required Information</h5>
                            <p className="text-muted mb-0 small">Please fill in all required fields.</p>
                        </div>
                        
                        <div className="alert alert-warning border-0 shadow-sm py-2 mb-3">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-list-check text-warning me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Required Fields</h6>
                                    <ul className="mb-0 text-start small">
                                        {!lastName && <li className="text-danger">Last Name is required</li>}
                                        {!firstName && <li className="text-danger">First Name is required</li>}
                                        {!course && <li className="text-danger">Course/Major is required</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="alert alert-info border-0 shadow-sm py-2">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-info-circle text-info me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Note</h6>
                                    <p className="mb-0 small">Fields marked with <span className="text-danger">*</span> are required.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) 
            });
            setIsModalOpen(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/students/create-and-enroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(newStudentInfo)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create student.');
            }

            setCreatedStudentData(data.user);
            setModalContent({
                title: 'Student Successfully Created & Enrolled!',
                body: (
                    <div className="text-center">
                        <div className="mb-3">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-check-circle text-success fa-2x"></i>
                            </div>
                            <h5 className="text-success fw-bold mb-1">Enrollment Successful!</h5>
                            <p className="text-muted mb-0 small">Student has been created and enrolled.</p>
                        </div>
                        
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-primary text-white py-2">
                                <h6 className="mb-0 fw-bold small">
                                    <i className="fas fa-user-graduate me-1"></i>
                                    Student Credentials
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                <div className="row g-2">
                                    <div className="col-6">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '30px', height: '30px' }}>
                                                <i className="fas fa-id-card text-primary small"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">ID Number</small>
                                                <span className="fw-bold text-dark small">{data.user.idNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center">
                                            <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '30px', height: '30px' }}>
                                                <i className="fas fa-key text-warning small"></i>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">Password</small>
                                                <span className="fw-bold text-dark small">{data.user.password}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="alert alert-info border-0 shadow-sm py-2 mb-3">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-info-circle text-info me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Important</h6>
                                    <ul className="mb-0 text-start small">
                                        <li>Provide credentials to student immediately</li>
                                        <li>Student should change password on first login</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2 justify-content-center">
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(`ID: ${data.user.idNumber}\nPassword: ${data.user.password}`);
                                }}
                            >
                                <i className="fas fa-copy me-1"></i>
                                Copy
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    window.print();
                                }}
                            >
                                <i className="fas fa-print me-1"></i>
                                Print
                            </button>
                        </div>
                    </div>
                )
            });
            setIsModalOpen(true);

        } catch (error) {
            console.error('Error creating student:', error);
            setModalContent({ 
                title: 'Enrollment Failed', 
                body: (
                    <div className="text-center">
                        <div className="mb-3">
                            <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                                <i className="fas fa-exclamation-triangle text-danger fa-2x"></i>
                            </div>
                            <h5 className="text-danger fw-bold mb-1">Enrollment Failed</h5>
                            <p className="text-muted mb-0 small">Error creating student account.</p>
                        </div>
                        
                        <div className="alert alert-danger border-0 shadow-sm py-2 mb-3">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-exclamation-circle text-danger me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Error Details</h6>
                                    <p className="mb-0 small">{error.message}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="alert alert-info border-0 shadow-sm py-2">
                            <div className="d-flex align-items-start">
                                <i className="fas fa-lightbulb text-info me-2 mt-0"></i>
                                <div>
                                    <h6 className="fw-bold mb-1 small">Troubleshooting</h6>
                                    <ul className="mb-0 text-start small">
                                        <li>Check required fields</li>
                                        <li>Verify student doesn't exist</li>
                                        <li>Check internet connection</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) 
            });
            setIsModalOpen(true);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (createdStudentData) {
            onCompleteEnrollment({
                id: createdStudentData.id,
                idNo: createdStudentData.idNumber,
                name: createdStudentData.name,
                gender: createdStudentData.gender,
                course: createdStudentData.course,
                createdAt: new Date().toLocaleDateString(),
            });
            setNewStudentInfo({ lastName: '', firstName: '', middleName: '', gender: 'Male', course: 'BSIT' });
            setCreatedStudentData(null);
        }
    };

    const removeSubject = (subjectCode) => { 
        setEnlistedSubjects(enlistedSubjects.filter(s => s.code !== subjectCode)); 
    };
    const totalUnits = enlistedSubjects.reduce((total, s) => total + s.units, 0);

    const renderEnrollmentSteps = () => {
        switch (step) {
            case 1:
                return (
                    <div className="card-body p-4">
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                                        <i className="fas fa-user-graduate text-primary fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-dark">Student Information</h5>
                                        <p className="text-muted mb-0">Review the student's registration details</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label fw-semibold text-dark">
                                        <i className="fas fa-id-card me-2 text-primary"></i>
                                        Registration No.
                                    </label>
                                    <input type="text" className="form-control form-control-lg" value={student.regNo} disabled />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="form-label fw-semibold text-dark">
                                        <i className="fas fa-graduation-cap me-2 text-primary"></i>
                                        Course/Major
                                    </label>
                                    <input type="text" className="form-control form-control-lg" value={student.course} disabled />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label fw-semibold text-dark">
                                        <i className="fas fa-user me-2 text-primary"></i>
                                        Last Name
                                    </label>
                                    <input type="text" className="form-control form-control-lg" value={student.name.split(',')[0]} disabled />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label fw-semibold text-dark">
                                        <i className="fas fa-user me-2 text-primary"></i>
                                        First Name
                                    </label>
                                    <input type="text" className="form-control form-control-lg" value={student.name.split(',')[1].trim().split(' ')[0]} disabled />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label className="form-label fw-semibold text-dark">
                                        <i className="fas fa-user me-2 text-primary"></i>
                                        Middle Name
                                    </label>
                                    <input type="text" className="form-control form-control-lg" value={student.name.split(' ').pop().replace('.', '')} disabled />
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex justify-content-end mt-4">
                            <button className="btn btn-primary btn-lg px-4" onClick={() => setStep(2)}>
                                <i className="fas fa-arrow-right me-2"></i>
                                Confirm and Proceed
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="card-body p-4">
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                                        <i className="fas fa-book text-success fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-dark">Subject Enrollment</h5>
                                        <p className="text-muted mb-0">Review and manage subjects for <span className="text-primary fw-semibold">{student.name}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="text-primary mb-2">
                                            <i className="fas fa-book fa-2x"></i>
                                        </div>
                                        <h4 className="mb-1 fw-bold">{enlistedSubjects.length}</h4>
                                        <p className="text-muted mb-0 small">Total Subjects</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="text-success mb-2">
                                            <i className="fas fa-graduation-cap fa-2x"></i>
                                        </div>
                                        <h4 className="mb-1 fw-bold">{totalUnits}</h4>
                                        <p className="text-muted mb-0 small">Total Units</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="text-info mb-2">
                                            <i className="fas fa-clock fa-2x"></i>
                                        </div>
                                        <h4 className="mb-1 fw-bold">{student.course}</h4>
                                        <p className="text-muted mb-0 small">Course</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body text-center">
                                        <div className="text-warning mb-2">
                                            <i className="fas fa-calendar fa-2x"></i>
                                        </div>
                                        <h4 className="mb-1 fw-bold">1st Year</h4>
                                        <p className="text-muted mb-0 small">Year Level</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0 py-3">
                                <h6 className="mb-0 fw-bold text-dark">
                                    <i className="fas fa-list me-2 text-primary"></i>
                                    Enlisted Subjects
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Code</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Description</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Schedule</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark text-center">Units</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enlistedSubjects.length > 0 ? enlistedSubjects.map(sub => (
                                                <tr key={sub.code} className="border-bottom">
                                                    <td className="px-3 py-3">
                                                        <span className="fw-semibold text-primary">{sub.code}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div>
                                                            <div className="fw-medium text-dark">{sub.description}</div>
                                                            <small className="text-muted">{sub.room || 'TBA'}</small>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="badge bg-info bg-opacity-10 text-info">
                                                            <i className="fas fa-clock me-1"></i>
                                                            {sub.days} {sub.schedule}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
                                                            {sub.units} unit{sub.units > 1 ? 's' : ''}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger" 
                                                            onClick={() => removeSubject(sub.code)} 
                                                            title="Remove Subject"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5">
                                                        <div className="text-muted">
                                                            <i className="fas fa-book fa-3x mb-3 opacity-50"></i>
                                                            <h5 className="mb-2">No subjects prescribed</h5>
                                                            <p className="mb-0">Please check the curriculum setup for this course.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="table-light">
                                                <td colSpan="3" className="text-end fw-bold py-3 px-3">Total Units:</td>
                                                <td className="text-center fw-bold py-3 px-3">
                                                    <span className="badge bg-primary">{totalUnits}</span>
                                                </td>
                                                <td className="py-3 px-3"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-secondary btn-lg px-4" onClick={() => setStep(1)}>
                                <i className="fas fa-arrow-left me-2"></i>
                                Back
                            </button>
                            <button 
                                className="btn btn-primary btn-lg px-4" 
                                onClick={() => setStep(3)} 
                                disabled={enlistedSubjects.length === 0}
                            >
                                <i className="fas fa-arrow-right me-2"></i>
                                Next
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="card-body p-4">
                        <div className="row mb-4">
                            <div className="col-12">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                                        <i className="fas fa-check-circle text-warning fa-lg"></i>
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-dark">Final Review</h5>
                                        <p className="text-muted mb-0">Review and confirm enrollment details</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-primary text-white py-3">
                                <h6 className="mb-0 fw-bold">
                                    <i className="fas fa-university me-2"></i>
                                    BENEDICTO COLLEGE
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-dark mb-2">Student Information</h6>
                                        <p className="mb-1"><strong>Name:</strong> {student.name.toUpperCase()}</p>
                                        <p className="mb-1"><strong>Registration No:</strong> {student.regNo}</p>
                                        <p className="mb-0"><strong>Course:</strong> {student.course}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold text-dark mb-2">Academic Period</h6>
                                        <p className="mb-1"><strong>School Year:</strong> 2024-2025</p>
                                        <p className="mb-1"><strong>Semester:</strong> Summer</p>
                                        <p className="mb-0"><strong>Year Level:</strong> 1st Year</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-0 py-3">
                                <h6 className="mb-0 fw-bold text-dark">
                                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                                    Subject Schedules
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Code</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Description</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Days</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Time</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark">Room</th>
                                                <th className="border-0 py-3 px-3 fw-semibold text-dark text-center">Units</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enlistedSubjects.map(sub => (
                                                <tr key={sub.code} className="border-bottom">
                                                    <td className="px-3 py-3">
                                                        <span className="fw-semibold text-primary">{sub.code}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div className="fw-medium text-dark">{sub.description}</div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="badge bg-info bg-opacity-10 text-info">{sub.days}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="text-muted">{sub.schedule}</span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="text-muted">{sub.room || 'TBA'}</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">
                                                            {sub.units}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="table-light">
                                                <td colSpan="5" className="text-end fw-bold py-3 px-3">Total Units</td>
                                                <td className="text-center fw-bold py-3 px-3">
                                                    <span className="badge bg-primary">{totalUnits}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-secondary btn-lg px-4" onClick={() => setStep(2)}>
                                <i className="fas fa-arrow-left me-2"></i>
                                Back
                            </button>
                            <button className="btn btn-success btn-lg px-4" onClick={() => onCompleteEnrollment(student)}>
                                <i className="fas fa-check me-2"></i>
                                Complete Enrollment
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    const renderCreateStudentForm = () => (
        <div className="card-body p-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-3">
                        <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                            <i className="fas fa-user-plus text-info fa-lg"></i>
                        </div>
                        <div>
                            <h5 className="mb-1 fw-bold text-dark">Create New Student</h5>
                            <p className="text-muted mb-0">Manually create a new student record for walk-ins, transferees, or special cases</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCreateAndEnroll}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-user me-2 text-primary"></i>
                                Last Name <span className="text-danger">*</span>
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                name="lastName" 
                                value={newStudentInfo.lastName} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isAdmin} 
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-user me-2 text-primary"></i>
                                First Name <span className="text-danger">*</span>
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                name="firstName" 
                                value={newStudentInfo.firstName} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isAdmin} 
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-user me-2 text-primary"></i>
                                Middle Name
                            </label>
                            <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                name="middleName" 
                                value={newStudentInfo.middleName} 
                                onChange={handleInputChange} 
                                disabled={!isAdmin}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-venus-mars me-2 text-primary"></i>
                                Gender
                            </label>
                            <select 
                                className="form-select form-select-lg" 
                                name="gender" 
                                value={newStudentInfo.gender} 
                                onChange={handleInputChange} 
                                disabled={!isAdmin}
                            >
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-graduation-cap me-2 text-primary"></i>
                                Course/Major <span className="text-danger">*</span>
                            </label>
                            <select 
                                className="form-select form-select-lg" 
                                name="course" 
                                value={newStudentInfo.course} 
                                onChange={handleInputChange} 
                                disabled={!isAdmin}
                            >
                                <option>BSIT</option>
                                <option>BSCS</option>
                                <option>BSBA-HRDM</option>
                                <option>BSED-EN</option>
                                <option>BS-ARCH</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-success btn-lg px-4">
                        <i className="fas fa-user-plus me-2"></i>
                        Create and Enroll Student
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="container-fluid px-4 py-3">
            {/* Modern Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1 fw-bold text-dark">New Enrollment</h2>
                    <p className="text-muted mb-0">Enroll students and manage their course registrations</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-download me-1"></i>Export
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <i className="fas fa-plus me-1"></i>Quick Add
                    </button>
                </div>
            </div>

            {/* Search Section */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="input-group input-group-lg">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Search Approved Registration No. to enroll..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!isAdmin}
                                />
                                <button className="btn btn-primary" type="button" onClick={handleSearch}>
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <div className="d-flex gap-2 justify-content-end">
                                <span className="badge bg-success bg-opacity-10 text-success">
                                    <i className="fas fa-check-circle me-1"></i>
                                    {registrations?.filter(r => r.status === 'approved').length || 0} Approved
                                </span>
                                <span className="badge bg-warning bg-opacity-10 text-warning">
                                    <i className="fas fa-clock me-1"></i>
                                    {registrations?.filter(r => r.status === 'pending').length || 0} Pending
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-sm">
                {student && (
                    <div className="card-header bg-white border-0 py-3">
                        <div className="d-flex align-items-center">
                            <div className="me-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-user-graduate text-primary"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1">
                                <h6 className="mb-1 fw-bold text-dark">{student.name}</h6>
                                <p className="text-muted mb-0">{student.course} • {student.regNo}</p>
                            </div>
                            <div className="ms-3">
                                <ul className="nav nav-pills">
                                    <li className="nav-item">
                                        <span className={`nav-link ${step === 1 ? 'active' : ''} px-3 py-2`}>
                                            <i className="fas fa-user me-1"></i>Info
                                        </span>
                                    </li>
                                    <li className="nav-item">
                                        <span className={`nav-link ${step === 2 ? 'active' : ''} px-3 py-2`}>
                                            <i className="fas fa-book me-1"></i>Subjects
                                        </span>
                                    </li>
                                    <li className="nav-item">
                                        <span className={`nav-link ${step === 3 ? 'active' : ''} px-3 py-2`}>
                                            <i className="fas fa-check me-1"></i>Review
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {student ? renderEnrollmentSteps() : renderCreateStudentForm()}
            </div>

            {/* Render the modal component */}
            <CustomAlert
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalContent.title}
            >
                {modalContent.body}
            </CustomAlert>
        </div>
    );
}

export default NewEnrollmentView;
