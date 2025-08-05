import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';
import './StudentRegistrationForm.css';

function StudentRegistrationForm({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            } else {
                console.error('Failed to fetch courses:', response.statusText);
                setError('Failed to load courses. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/students/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Student registration completed successfully!');
                if (onComplete) onComplete(result);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep1 = () => (
        <div className="registration-step">
            <div className="step-header">
                <div className="step-icon">
                    <i className="fas fa-user"></i>
                </div>
                <div className="step-title">
                    <h3>Personal Information</h3>
                    <p>Please provide your basic personal details</p>
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Gender <span className="required">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-control" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Date of Birth <span className="required">*</span></label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Place of Birth <span className="required">*</span></label>
                    <input
                        type="text"
                        name="placeOfBirth"
                        value={formData.placeOfBirth}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter place of birth"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your email address"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Contact Number <span className="required">*</span></label>
                    <input
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your contact number"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Marital Status <span className="required">*</span></label>
                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="form-control" required>
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Religion <span className="required">*</span></label>
                    <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your religion"
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">City Address <span className="required">*</span></label>
                    <textarea
                        name="cityAddress"
                        value={formData.cityAddress}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your complete city address"
                        rows="3"
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Provincial Address <span className="required">*</span></label>
                    <textarea
                        name="provincialAddress"
                        value={formData.provincialAddress}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your complete provincial address"
                        rows="3"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">City Telephone</label>
                    <input
                        type="tel"
                        name="cityTelNumber"
                        value={formData.cityTelNumber}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter city telephone"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Provincial Telephone</label>
                    <input
                        type="tel"
                        name="provincialTelNumber"
                        value={formData.provincialTelNumber}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter provincial telephone"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="registration-step">
            <div className="step-header">
                <div className="step-icon">
                    <i className="fas fa-users"></i>
                </div>
                <div className="step-title">
                    <h3>Family Background</h3>
                    <p>Please provide information about your family</p>
                </div>
            </div>

            <div className="family-section">
                <div className="section-header">
                    <h4><i className="fas fa-male"></i> Father's Information</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Father's Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter father's name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Occupation <span className="required">*</span></label>
                        <input
                            type="text"
                            name="fatherOccupation"
                            value={formData.fatherOccupation}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter father's occupation"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Number <span className="required">*</span></label>
                        <input
                            type="tel"
                            name="fatherContactNumber"
                            value={formData.fatherContactNumber}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter father's contact number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            name="fatherCompany"
                            value={formData.fatherCompany}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter company name and address"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Address <span className="required">*</span></label>
                        <textarea
                            name="fatherAddress"
                            value={formData.fatherAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter father's complete address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="family-section">
                <div className="section-header">
                    <h4><i className="fas fa-female"></i> Mother's Information</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Mother's Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter mother's name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Occupation <span className="required">*</span></label>
                        <input
                            type="text"
                            name="motherOccupation"
                            value={formData.motherOccupation}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter mother's occupation"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Number <span className="required">*</span></label>
                        <input
                            type="tel"
                            name="motherContactNumber"
                            value={formData.motherContactNumber}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter mother's contact number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            name="motherCompany"
                            value={formData.motherCompany}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter company name and address"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Address <span className="required">*</span></label>
                        <textarea
                            name="motherAddress"
                            value={formData.motherAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter mother's complete address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="family-section">
                <div className="section-header">
                    <h4><i className="fas fa-user-shield"></i> Guardian's Information</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Guardian's Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter guardian's name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Occupation <span className="required">*</span></label>
                        <input
                            type="text"
                            name="guardianOccupation"
                            value={formData.guardianOccupation}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter guardian's occupation"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contact Number <span className="required">*</span></label>
                        <input
                            type="tel"
                            name="guardianContactNumber"
                            value={formData.guardianContactNumber}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter guardian's contact number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                            type="text"
                            name="guardianCompany"
                            value={formData.guardianCompany}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter company name and address"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">Address <span className="required">*</span></label>
                        <textarea
                            name="guardianAddress"
                            value={formData.guardianAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter guardian's complete address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="registration-step">
            <div className="step-header">
                <div className="step-icon">
                    <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="step-title">
                    <h3>Academic Information</h3>
                    <p>Please provide your current academic details</p>
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label className="form-label">Course</label>
                    <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="form-control">
                        <option value="">Select Course (Optional)</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Major</label>
                    <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Enter your major"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Student Type <span className="required">*</span></label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="studentType"
                                value="First"
                                checked={formData.studentType === 'First'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            First Time
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="studentType"
                                value="Second"
                                checked={formData.studentType === 'Second'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Second Time
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="studentType"
                                value="Summer"
                                checked={formData.studentType === 'Summer'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Summer
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Semester Entry <span className="required">*</span></label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="semesterEntry"
                                value="First"
                                checked={formData.semesterEntry === 'First'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            First Semester
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="semesterEntry"
                                value="Second"
                                checked={formData.semesterEntry === 'Second'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Second Semester
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="semesterEntry"
                                value="Summer"
                                checked={formData.semesterEntry === 'Summer'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Summer
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Year of Entry <span className="required">*</span></label>
                    <input
                        type="number"
                        name="yearOfEntry"
                        value={formData.yearOfEntry}
                        onChange={handleInputChange}
                        className="form-control"
                        min="2000"
                        max="2030"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Estimated Year of Graduation</label>
                    <input
                        type="number"
                        name="estimatedYearOfGraduation"
                        value={formData.estimatedYearOfGraduation}
                        onChange={handleInputChange}
                        className="form-control"
                        min="2000"
                        max="2030"
                        placeholder="e.g., 2028"
                    />
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Type of Application <span className="required">*</span></label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="applicationType"
                                value="Freshmen"
                                checked={formData.applicationType === 'Freshmen'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Freshmen
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="applicationType"
                                value="Transferee"
                                checked={formData.applicationType === 'Transferee'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Transferee
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="applicationType"
                                value="Cross Enrollee"
                                checked={formData.applicationType === 'Cross Enrollee'}
                                onChange={handleInputChange}
                            />
                            <span className="radio-custom"></span>
                            Cross Enrollee
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="registration-step">
            <div className="step-header">
                <div className="step-icon">
                    <i className="fas fa-history"></i>
                </div>
                <div className="step-title">
                    <h3>Academic History</h3>
                    <p>Please provide your complete academic background</p>
                </div>
            </div>

            <div className="academic-section">
                <div className="section-header">
                    <h4><i className="fas fa-school"></i> Elementary Education</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">School Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="elementarySchool"
                            value={formData.elementarySchool}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter elementary school name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year Graduated <span className="required">*</span></label>
                        <input
                            type="number"
                            name="elementaryYearGraduated"
                            value={formData.elementaryYearGraduated}
                            onChange={handleInputChange}
                            className="form-control"
                            min="1990"
                            max="2030"
                            placeholder="e.g., 2015"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Honor Received</label>
                        <input
                            type="text"
                            name="elementaryHonor"
                            value={formData.elementaryHonor}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter honor received"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">School Address <span className="required">*</span></label>
                        <textarea
                            name="elementaryAddress"
                            value={formData.elementaryAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter complete school address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="academic-section">
                <div className="section-header">
                    <h4><i className="fas fa-chalkboard-teacher"></i> Junior High School</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">School Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="juniorHighSchool"
                            value={formData.juniorHighSchool}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter junior high school name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year Graduated <span className="required">*</span></label>
                        <input
                            type="number"
                            name="juniorHighYearGraduated"
                            value={formData.juniorHighYearGraduated}
                            onChange={handleInputChange}
                            className="form-control"
                            min="1990"
                            max="2030"
                            placeholder="e.g., 2019"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Honor Received</label>
                        <input
                            type="text"
                            name="juniorHighHonor"
                            value={formData.juniorHighHonor}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter honor received"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">School Address <span className="required">*</span></label>
                        <textarea
                            name="juniorHighAddress"
                            value={formData.juniorHighAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter complete school address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="academic-section">
                <div className="section-header">
                    <h4><i className="fas fa-user-graduate"></i> Senior High School</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">School Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="seniorHighSchool"
                            value={formData.seniorHighSchool}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter senior high school name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Strand</label>
                        <input
                            type="text"
                            name="seniorHighStrand"
                            value={formData.seniorHighStrand}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="e.g., STEM, ABM, HUMSS"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year Graduated <span className="required">*</span></label>
                        <input
                            type="number"
                            name="seniorHighYearGraduated"
                            value={formData.seniorHighYearGraduated}
                            onChange={handleInputChange}
                            className="form-control"
                            min="1990"
                            max="2030"
                            placeholder="e.g., 2021"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Honor Received</label>
                        <input
                            type="text"
                            name="seniorHighHonor"
                            value={formData.seniorHighHonor}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter honor received"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">NCAE Grade</label>
                        <input
                            type="text"
                            name="ncaeGrade"
                            value={formData.ncaeGrade}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter NCAE grade"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter specialization"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="form-label">School Address <span className="required">*</span></label>
                        <textarea
                            name="seniorHighAddress"
                            value={formData.seniorHighAddress}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter complete school address"
                            rows="2"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="academic-section">
                <div className="section-header">
                    <h4><i className="fas fa-university"></i> College Information (If Applicable)</h4>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Last College Attended</label>
                        <input
                            type="text"
                            name="lastCollegeAttended"
                            value={formData.lastCollegeAttended}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter college name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Year Taken</label>
                        <input
                            type="number"
                            name="lastCollegeYearTaken"
                            value={formData.lastCollegeYearTaken}
                            onChange={handleInputChange}
                            className="form-control"
                            min="1990"
                            max="2030"
                            placeholder="e.g., 2022"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Course</label>
                        <input
                            type="text"
                            name="lastCollegeCourse"
                            value={formData.lastCollegeCourse}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter course name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Major</label>
                        <input
                            type="text"
                            name="lastCollegeMajor"
                            value={formData.lastCollegeMajor}
                            onChange={handleInputChange}
                            className="form-control"
                            placeholder="Enter major"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            default: return renderStep1();
        }
    };

    const steps = [
        { number: 1, title: 'Personal Info', icon: 'fas fa-user' },
        { number: 2, title: 'Family Background', icon: 'fas fa-users' },
        { number: 3, title: 'Academic Info', icon: 'fas fa-graduation-cap' },
        { number: 4, title: 'Academic History', icon: 'fas fa-history' }
    ];

    return (
        <div className="student-registration-form">
            <div className="form-container">
                <div className="form-header">
                    <div className="header-content">
                        <div className="logo-section">
                            <div className="logo-icon">
                                <i className="fas fa-university"></i>
                            </div>
                            <div className="logo-text">
                                <h2>Benedicto College</h2>
                                <h3>Student Registration Form</h3>
                            </div>
                        </div>
                        <div className="progress-section">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${(currentStep / 4) * 100}%` }}
                                ></div>
                            </div>
                            <div className="step-indicators">
                                {steps.map((step, index) => (
                                    <div 
                                        key={step.number} 
                                        className={`step-indicator ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}
                                    >
                                        <div className="step-number">
                                            <i className={step.icon}></i>
                                        </div>
                                        <span className="step-title">{step.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="registration-form">
                    {renderStepContent()}

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            {error}
                        </div>
                    )}

                    <div className="form-navigation">
                        <div className="nav-buttons">
                            {currentStep > 1 && (
                                <button type="button" onClick={prevStep} className="btn btn-outline">
                                    <i className="fas fa-arrow-left"></i>
                                    Previous
                                </button>
                            )}
                            
                            {currentStep < 4 ? (
                                <button type="button" onClick={nextStep} className="btn btn-primary">
                                    Next
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check"></i>
                                            Submit Registration
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        <div className="form-info">
                            <p><i className="fas fa-info-circle"></i> All fields marked with <span className="required">*</span> are required</p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentRegistrationForm;