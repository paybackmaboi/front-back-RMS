import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

function EditStudentView({ enrolledStudents, refreshStudents }) {
    const { idNo } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [courses, setCourses] = useState([]);
    
    const [formData, setFormData] = useState({
        // I. PERSONAL DATA
        fullName: '',
        gender: '',
        maritalStatus: '',
        dateOfBirth: '',
        placeOfBirth: '',
        email: '',
        contactNumber: '',
        religion: '',
        citizenship: 'Filipino',
        country: 'Philippines',
        acrNumber: '',
        cityAddress: '',
        cityTelNumber: '',
        provincialAddress: '',
        provincialTelNumber: '',
        
        // II. FAMILY BACKGROUND
        // Father's Information
        fatherName: '',
        fatherAddress: '',
        fatherOccupation: '',
        fatherCompany: '',
        fatherContactNumber: '',
        fatherIncome: '',
        
        // Mother's Information
        motherName: '',
        motherAddress: '',
        motherOccupation: '',
        motherCompany: '',
        motherContactNumber: '',
        motherIncome: '',
        
        // Guardian's Information
        guardianName: '',
        guardianAddress: '',
        guardianOccupation: '',
        guardianCompany: '',
        guardianContactNumber: '',
        guardianIncome: '',
        
        // III. CURRENT ACADEMIC BACKGROUND
        courseId: '',
        major: '',
        studentType: 'First',
        semesterEntry: 'First',
        yearOfEntry: new Date().getFullYear(),
        estimatedYearOfGraduation: '',
        applicationType: 'Freshmen',
        
        // IV. ACADEMIC HISTORY
        // Elementary
        elementarySchool: '',
        elementaryAddress: '',
        elementaryHonor: '',
        elementaryYearGraduated: '',
        
        // Junior High School
        juniorHighSchool: '',
        juniorHighAddress: '',
        juniorHighHonor: '',
        juniorHighYearGraduated: '',
        
        // Senior High School
        seniorHighSchool: '',
        seniorHighAddress: '',
        seniorHighStrand: '',
        seniorHighHonor: '',
        seniorHighYearGraduated: '',
        
        // Additional Academic Information
        ncaeGrade: '',
        specialization: '',
        lastCollegeAttended: '',
        lastCollegeYearTaken: '',
        lastCollegeCourse: '',
        lastCollegeMajor: ''
    });

    useEffect(() => {
        fetchCourses();
        loadStudentData();
    }, [idNo]);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.ok) {
                const coursesData = await response.json();
                setCourses(coursesData);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const loadStudentData = async () => {
        try {
            setLoading(true);
            console.log('Loading student data for ID:', idNo);
            console.log('Available enrolledStudents:', enrolledStudents);
            
            // First try to find student in the enrolledStudents prop
            let student = enrolledStudents.find(s => s.idNo === idNo);
            
            // If not found, try alternative search methods
            if (!student) {
                student = enrolledStudents.find(s => s.id === idNo);
            }
            if (!student) {
                student = enrolledStudents.find(s => s.idNumber === idNo);
            }
            
            console.log('Found student:', student);
            
            if (student) {
                // Try to fetch detailed student data from backend
                try {
                    console.log('Fetching detailed student data from backend...');
                    const response = await fetch(`${API_BASE_URL}/students/${student.id}`, {
                        headers: {
                            'Authorization': `Bearer ${getToken()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const detailedStudentData = await response.json();
                        console.log('Detailed student data from backend:', detailedStudentData);
                        
                        // Map the detailed student data to form fields
                        setFormData(prev => ({
                            ...prev,
                            fullName: detailedStudentData.fullName || detailedStudentData.name || student.name || '',
                            gender: detailedStudentData.gender || student.gender || '',
                            email: detailedStudentData.email || '',
                            contactNumber: detailedStudentData.contactNumber || detailedStudentData.phoneNumber || '',
                            courseId: detailedStudentData.courseId || detailedStudentData.course?.id || 1, // Default course ID
                            dateOfBirth: detailedStudentData.dateOfBirth ? 
                                (typeof detailedStudentData.dateOfBirth === 'string' ? 
                                    detailedStudentData.dateOfBirth.split('T')[0] : 
                                    new Date(detailedStudentData.dateOfBirth).toISOString().split('T')[0]
                                ) : '1900-01-01', // Default date for required field
                            placeOfBirth: detailedStudentData.placeOfBirth || '',
                            maritalStatus: detailedStudentData.maritalStatus || '',
                            religion: detailedStudentData.religion || '',
                            cityAddress: detailedStudentData.cityAddress || detailedStudentData.address || '',
                            provincialAddress: detailedStudentData.provincialAddress || '',
                            cityTelNumber: detailedStudentData.cityTelNumber || '',
                            provincialTelNumber: detailedStudentData.provincialTelNumber || '',
                            fatherName: detailedStudentData.fatherName || '',
                            fatherOccupation: detailedStudentData.fatherOccupation || '',
                            motherName: detailedStudentData.motherName || '',
                            motherOccupation: detailedStudentData.motherOccupation || '',
                            guardianName: detailedStudentData.guardianName || '',
                            guardianOccupation: detailedStudentData.guardianOccupation || '',
                            elementarySchool: detailedStudentData.elementarySchool || '',
                            elementaryYearGraduated: detailedStudentData.elementaryYearGraduated || 0, // Default year
                            juniorHighSchool: detailedStudentData.juniorHighSchool || '',
                            juniorHighYearGraduated: detailedStudentData.juniorHighYearGraduated || 0, // Default year
                            seniorHighSchool: detailedStudentData.seniorHighSchool || '',
                            seniorHighStrand: detailedStudentData.seniorHighStrand || '',
                            major: detailedStudentData.major || '',
                            studentType: detailedStudentData.studentType || 'First',
                            yearOfEntry: detailedStudentData.yearOfEntry || new Date().getFullYear(),
                            estimatedYearOfGraduation: detailedStudentData.estimatedYearOfGraduation || new Date().getFullYear() + 4,
                            lastCollegeAttended: detailedStudentData.lastCollegeAttended || '',
                            lastCollegeYearTaken: detailedStudentData.lastCollegeYearTaken || 0, // Default year
                            lastCollegeCourse: detailedStudentData.lastCollegeCourse || '',
                            lastCollegeMajor: detailedStudentData.lastCollegeMajor || ''
                        }));
                    } else {
                        console.log('Backend fetch failed, using basic student data');
                        // If backend fails, use the basic student data
                        setFormData(prev => ({
                            ...prev,
                            fullName: student.name || '',
                            gender: student.gender || '',
                            email: student.email || '',
                            contactNumber: student.contactNumber || '',
                            courseId: student.courseId || 1, // Default course ID
                            dateOfBirth: '1900-01-01', // Default date for required field
                            elementaryYearGraduated: 0, // Default year for required field
                            juniorHighYearGraduated: 0, // Default year for required field
                            seniorHighYearGraduated: 0, // Default year for required field
                            lastCollegeYearTaken: 0, // Default year for required field
                            yearOfEntry: new Date().getFullYear(),
                            estimatedYearOfGraduation: new Date().getFullYear() + 4
                            // Add other basic mappings
                        }));
                    }
                } catch (error) {
                    console.log('Network error, using basic student data');
                    // If network error, use the basic student data
                    setFormData(prev => ({
                        ...prev,
                        fullName: student.name || '',
                        gender: student.gender || '',
                        email: student.email || '',
                        contactNumber: student.contactNumber || '',
                        courseId: student.courseId || 1, // Default course ID
                        dateOfBirth: '1900-01-01', // Default date for required field
                        elementaryYearGraduated: 0, // Default year for required field
                        juniorHighYearGraduated: 0, // Default year for required field
                        seniorHighYearGraduated: 0, // Default year for required field
                        lastCollegeYearTaken: 0, // Default year for required field
                        yearOfEntry: new Date().getFullYear(),
                        estimatedYearOfGraduation: new Date().getFullYear() + 4
                        // Add other basic mappings
                    }));
                }
            } else {
                // If no student found, show error
                setError(`Student not found with ID: ${idNo}. Please check the student list and try again.`);
            }
        } catch (error) {
            setError('Failed to load student data');
            console.error('Error loading student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for date fields
        if (name === 'dateOfBirth') {
            // Validate date format
            if (value && !isValidDate(value)) {
                setError('Please enter a valid date of birth');
                return;
            } else {
                setError(''); // Clear error if date is valid
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper function to validate date
    const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Find the student to get the correct ID
            const student = enrolledStudents.find(s => s.idNo === idNo) || 
                          enrolledStudents.find(s => s.id === idNo) || 
                          enrolledStudents.find(s => s.idNumber === idNo);
            
            if (!student) {
                setError('Student not found. Please check the student list and try again.');
                setSaving(false);
                return;
            }

            // Clean up the form data before sending
            const cleanedFormData = {
                ...formData,
                // Handle date fields properly - provide defaults for required fields
                dateOfBirth: formData.dateOfBirth && formData.dateOfBirth !== 'Invalid Date' ? 
                    formData.dateOfBirth : '1900-01-01', // Default date for required field
                courseId: formData.courseId || 1, // Default course ID for required field
                elementaryYearGraduated: formData.elementaryYearGraduated || 0, // Default year for required field
                juniorHighYearGraduated: formData.juniorHighYearGraduated || 0, // Default year for required field
                seniorHighYearGraduated: formData.seniorHighYearGraduated || 0, // Default year for required field
                lastCollegeYearTaken: formData.lastCollegeYearTaken || 0, // Default year for required field
                yearOfEntry: formData.yearOfEntry || new Date().getFullYear(),
                estimatedYearOfGraduation: formData.estimatedYearOfGraduation || new Date().getFullYear() + 4
            };

            console.log('Saving student data for ID:', student.id);
            console.log('Form data to save:', cleanedFormData);

            const response = await fetch(`${API_BASE_URL}/students/${student.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(cleanedFormData)
            });

            if (response.ok) {
                const updatedStudent = await response.json();
                console.log('Student updated successfully:', updatedStudent);
                setSuccess('Student information updated successfully!');
                
                // Refresh the student list to show updated data
                if (refreshStudents) {
                    setTimeout(() => {
                        refreshStudents();
                    }, 500);
                }
                
                setTimeout(() => {
                    navigate('/admin/all-students');
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Backend error:', errorData);
                setError(errorData.message || 'Failed to update student information. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/all-students');
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !formData.fullName) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button className="btn btn-outline-danger ms-3" onClick={() => navigate('/admin/all-students')}>
                        Back to Students
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="m-0">Edit Student</h2>
                    <p className="text-muted mb-0">ID: {idNo}</p>
                </div>
                <div>
                    <button 
                        className="btn btn-outline-secondary me-2" 
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Form */}
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h4 className="card-title mb-0">Student Information</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Personal Data Section */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="fas fa-user me-2 text-primary"></i>
                                    Personal Data
                                </h5>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Gender *</label>
                                <select
                                    className="form-select"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Contact Number</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    pattern="\d{4}-\d{2}-\d{2}"
                                />
                                {error && error.includes('date of birth') && (
                                    <div className="text-danger small mt-1">{error}</div>
                                )}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Place of Birth</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="placeOfBirth"
                                    value={formData.placeOfBirth}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Marital Status</label>
                                <select
                                    className="form-select"
                                    name="maritalStatus"
                                    value={formData.maritalStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                    <option value="Divorced">Divorced</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Religion</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="religion"
                                    value={formData.religion}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Academic Information Section */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="fas fa-graduation-cap me-2 text-primary"></i>
                                    Academic Information
                                </h5>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Course</label>
                                <select
                                    className="form-select"
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Major</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="major"
                                    value={formData.major}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Student Type</label>
                                <select
                                    className="form-select"
                                    name="studentType"
                                    value={formData.studentType}
                                    onChange={handleInputChange}
                                >
                                    <option value="First">First Time</option>
                                    <option value="Transfer">Transfer</option>
                                    <option value="Returning">Returning</option>
                                </select>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Year of Entry</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="yearOfEntry"
                                    value={formData.yearOfEntry}
                                    onChange={handleInputChange}
                                    min="2000"
                                    max="2030"
                                />
                            </div>
                        </div>

                        {/* Address Information Section */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                                    Address Information
                                </h5>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">City Address</label>
                                <textarea
                                    className="form-control"
                                    name="cityAddress"
                                    value={formData.cityAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Provincial Address</label>
                                <textarea
                                    className="form-control"
                                    name="provincialAddress"
                                    value={formData.provincialAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">City Telephone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="cityTelNumber"
                                    value={formData.cityTelNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Provincial Telephone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="provincialTelNumber"
                                    value={formData.provincialTelNumber}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Family Background Section */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="fas fa-users me-2 text-primary"></i>
                                    Family Background
                                </h5>
                            </div>

                            {/* Father's Information */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Father's Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Father's Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="fatherOccupation"
                                    value={formData.fatherOccupation}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Mother's Information */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Mother's Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="motherName"
                                    value={formData.motherName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Mother's Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="motherOccupation"
                                    value={formData.motherOccupation}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Guardian's Information */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Guardian's Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Guardian's Occupation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="guardianOccupation"
                                    value={formData.guardianOccupation}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Academic History Section */}
                        <div className="row mb-4">
                            <div className="col-12">
                                <h5 className="border-bottom pb-2 mb-3">
                                    <i className="fas fa-history me-2 text-primary"></i>
                                    Academic History
                                </h5>
                            </div>

                            {/* Elementary */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Elementary School</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="elementarySchool"
                                    value={formData.elementarySchool}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Elementary Year Graduated</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="elementaryYearGraduated"
                                    value={formData.elementaryYearGraduated || ''}
                                    onChange={handleInputChange}
                                    min="1990"
                                    max="2030"
                                    placeholder="Enter year (e.g., 2020)"
                                />
                                <small className="text-muted">Leave empty or enter 0 if not applicable</small>
                            </div>

                            {/* Junior High School */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Junior High School</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="juniorHighSchool"
                                    value={formData.juniorHighSchool}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Junior High Year Graduated</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="juniorHighYearGraduated"
                                    value={formData.juniorHighYearGraduated || ''}
                                    onChange={handleInputChange}
                                    min="1990"
                                    max="2030"
                                    placeholder="Enter year (e.g., 2020)"
                                />
                                <small className="text-muted">Leave empty or enter 0 if not applicable</small>
                            </div>

                            {/* Senior High School */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Senior High School</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="seniorHighSchool"
                                    value={formData.seniorHighSchool}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Senior High Strand</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="seniorHighStrand"
                                    value={formData.seniorHighStrand}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Senior High Year Graduated</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="seniorHighYearGraduated"
                                    value={formData.seniorHighYearGraduated || ''}
                                    onChange={handleInputChange}
                                    min="1990"
                                    max="2030"
                                    placeholder="Enter year (e.g., 2020)"
                                />
                                <small className="text-muted">Leave empty or enter 0 if not applicable</small>
                            </div>

                            {/* College Information */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last College Attended</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastCollegeAttended"
                                    value={formData.lastCollegeAttended}
                                    onChange={handleInputChange}
                                    placeholder="Enter college name"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last College Year Taken</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="lastCollegeYearTaken"
                                    value={formData.lastCollegeYearTaken || ''}
                                    onChange={handleInputChange}
                                    min="1990"
                                    max="2030"
                                    placeholder="Enter year (e.g., 2020)"
                                />
                                <small className="text-muted">Leave empty or enter 0 if not applicable</small>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last College Course</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastCollegeCourse"
                                    value={formData.lastCollegeCourse}
                                    onChange={handleInputChange}
                                    placeholder="Enter course name"
                                />
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Last College Major</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="lastCollegeMajor"
                                    value={formData.lastCollegeMajor}
                                    onChange={handleInputChange}
                                    placeholder="Enter major"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditStudentView; 