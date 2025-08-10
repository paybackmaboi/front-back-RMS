import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

function AllRegistrationsView({ registrations, setRegistrations }) {
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    // Memoize filtered registrations to prevent unnecessary re-renders
    const filteredRegistrations = useMemo(() => {
        return registrations.filter(reg => reg.status === activeTab);
    }, [registrations, activeTab]);

    // Fetch pending enrollments from enrollment system
    const fetchPendingEnrollments = useCallback(async () => {
        // Prevent multiple simultaneous requests
        const now = Date.now();
        if (now - lastFetchTime < 500) { // 5 second cooldown
            // console.log('Skipping fetch - too soon since last request');
            return;
        }
        
        setLoading(true);
        setLastFetchTime(now);
        setError(null);
        
        try {
            // console.log('Fetching pending enrollments from enrollment system...');
            const response = await axios.get('http://localhost:5000/api/enrollment/rms/pending', {
                timeout: 20000 // 20 second timeout
            });
            
            // console.log('Response received:', response.data);
            
            if (response.data.success) {
                // console.log(`Found ${response.data.count} pending enrollments`);
                // console.log('Enrollments data:', response.data.enrollments);
                
                // Transform enrollment data to registration format
                const transformedRegistrations = response.data.enrollments.map(enrollment => ({
                    id: enrollment.id,
                    regNo: enrollment.regNo,
                    name: enrollment.name,
                    email: enrollment.email,
                    studentId: enrollment.studentId,
                    course: enrollment.course,
                    courseName: enrollment.courseName,
                    department: enrollment.department,
                    credits: enrollment.credits,
                    semester: enrollment.semester,
                    academicYear: enrollment.academicYear,
                    date: new Date(enrollment.date).toLocaleDateString(),
                    status: 'pending',
                    amountPaid: enrollment.amountPaid,
                    totalAmount: enrollment.totalAmount,
                    statusUpdatedAt: enrollment.date, // Use enrollment creation date as initial status update
                    enrollmentData: enrollment.enrollmentData
                }));

                // console.log('Transformed registrations:', transformedRegistrations);

                // Update the registrations state only if data has changed
                setRegistrations(prevRegistrations => {
                    // console.log('Previous registrations:', prevRegistrations);
                    
                    // Get existing registrations that are NOT pending (approved/rejected)
                    const nonPendingRegistrations = prevRegistrations.filter(reg => reg.status !== 'pending');
                    
                    // Combine non-pending registrations with new pending ones
                    const newRegistrations = [...nonPendingRegistrations, ...transformedRegistrations];
                    
                    // console.log('Non-pending registrations kept:', nonPendingRegistrations);
                    // console.log('New registrations state:', newRegistrations);
                    
                    return newRegistrations;
                });
            }
        } catch (error) {
            console.error('Error fetching pending enrollments:', error);
            setError('Failed to fetch pending enrollments');
            // Don't show error to user for background sync, just log it
        } finally {
            setLoading(false);
        }
    }, [lastFetchTime, setRegistrations]);

    // Fetch data on component mount and when activeTab changes to pending
    useEffect(() => {
        if (activeTab === 'pending') {
            fetchPendingEnrollments();
        }
    }, [activeTab, fetchPendingEnrollments]);

    // Set up periodic refresh for pending tab (every 60 seconds instead of 30)
    useEffect(() => {
        if (activeTab === 'pending') {
            const interval = setInterval(() => {
                fetchPendingEnrollments();
            }, 60000); // 60 seconds

            return () => clearInterval(interval);
        }
    }, [activeTab, fetchPendingEnrollments]);

    const handleUpdateStatus = useCallback(async (id, newStatus) => {
        // Remove restrictive role check - allow all admin users to approve/reject
        // if (userRole !== 'accounting') {
        //     return;
        // }   
        
        try {
            // First, update the status in the Enrollment System
            const success = await updateEnrollmentStatus(id, newStatus);
            
            if (success) {
                // Update local state to move the student to the appropriate tab
                setRegistrations(regs => {
                    const updatedRegs = regs.map(reg => 
                        reg.id === id ? { 
                            ...reg, 
                            status: newStatus,
                            statusUpdatedAt: new Date().toISOString()
                        } : reg
                    );
                    
                    // Log the change for debugging (minimal logging to prevent flickering)
                    // console.log(`Student ${id} status updated to ${newStatus}`);
                    // console.log('Updated registrations:', updatedRegs);
                    
                    return updatedRegs;
                });
                
                // Show success message
                setSuccessMessage(`Student ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError('Failed to update student status. Please try again.');
                // Clear error message after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        } catch (error) {
            console.error('Error updating student status:', error);
            setError('Error updating student status. Please try again.');
            // Clear error message after 5 seconds
            setTimeout(() => setError(null), 5000);
        }
    }, [setRegistrations]);

    // Function to update enrollment status in the Enrollment System
    const updateEnrollmentStatus = async (enrollmentId, newStatus) => {
        try {
            // console.log(`Updating enrollment ${enrollmentId} status to ${newStatus}...`);
            
            const response = await axios.put(
                `http://localhost:5000/api/enrollment/rms/${enrollmentId}/status`,
                {
                    status: newStatus,
                    notes: `Status updated to ${newStatus} by RMS system`
                },
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // console.log('Response received:', response.data);
            
            if (response.data.success || response.data.message) {
                // console.log('Enrollment status updated successfully:', response.data);
                return true;
            } else {
                console.error('Failed to update enrollment status:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error updating enrollment status:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            }
            return false;
        }
    };

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        
        // Clear any existing messages when switching tabs
        setSuccessMessage(null);
        setError(null);
        
        // Refresh data when switching to pending tab to get latest enrollments
        if (tab === 'pending') {
            fetchPendingEnrollments();
        }
    }, [fetchPendingEnrollments]);

    // Function to refresh data for the current tab
    const refreshCurrentTabData = useCallback(() => {
        if (activeTab === 'pending') {
            fetchPendingEnrollments();
        }
        // For approved/rejected tabs, we rely on the existing data in state
        // since these are managed locally after approval/rejection
    }, [activeTab, fetchPendingEnrollments]);
    
    return (
        <div className="container-fluid">
            <h2 className="mb-2">All Registrations</h2>
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <div className="d-flex flex-wrap align-items-center">
                        <h4 className="card-title mb-0 me-3">Registration List</h4>
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <button
                                    className={`button-link pending-btn ${activeTab === 'pending' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('pending')}>
                                    Pending ({registrations.filter(r => r.status === 'pending').length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`button-link approved-btn ${activeTab === 'approved' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('approved')}>
                                    Approved ({registrations.filter(r => r.status === 'approved').length})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`button-link rejected-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('rejected')}>
                                    Rejected ({registrations.filter(r => r.status === 'rejected').length})
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="card-body">
                    {/* Success and Error Messages */}
                    {successMessage && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            {successMessage}
                            <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                        </div>
                    )}
                    
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Search..." disabled={isAdmin}/>
                                <button className="btn btn-outline-secondary" type="button">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <button 
                                className="btn btn-outline-primary" 
                                onClick={refreshCurrentTabData}
                                disabled={loading}
                            >
                                <i className="fas fa-sync-alt me-2"></i>
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                        <div className="col-md-3 ms-auto">
                            <select className="form-select" disabled={isAdmin}>
                                <option>2024-2025 Summer</option>
                            </select>
                        </div>
                    </div>
                    <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th>Reg. No.</th>
                                    <th>Name</th>
                                    <th>Student ID</th>
                                    <th>Course</th>
                                    <th>Semester</th>
                                    <th>Date of Registration</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && activeTab === 'pending' ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Loading pending enrollments...
                                        </td>
                                    </tr>
                                ) : filteredRegistrations.length > 0 ? (
                                    filteredRegistrations.map(reg => (
                                        <tr key={reg.id}>
                                            <td>{reg.regNo}</td>
                                            <td>{reg.name}</td>
                                            <td>{reg.studentId || 'N/A'}</td>
                                            <td>{reg.course} - {reg.courseName}</td>
                                            <td>{reg.semester || 'N/A'}</td>
                                            <td>{reg.date}</td>
                                            <td>
                                                {activeTab === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
                                                {activeTab === 'approved' && <span className="badge bg-success">Approved</span>}
                                                {activeTab === 'rejected' && <span className="badge bg-danger">Rejected</span>}
                                            </td>
                                            <td>
                                                {reg.statusUpdatedAt ? new Date(reg.statusUpdatedAt).toLocaleString() : 'N/A'}
                                            </td>
                                            <td>
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(reg.id, 'approved')}>
                                                            <i className="fas fa-check me-1"></i>Approve
                                                        </button>
                                                        <button className="btn btn-sm btn-danger" onClick={() => handleUpdateStatus(reg.id, 'rejected')}>
                                                            <i className="fas fa-times me-1"></i>Reject
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'approved' && (
                                                    <div>
                                                        <div className="text-success mb-1">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Approved
                                                        </div>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning" 
                                                            onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                                            title="Revert to pending status"
                                                        >
                                                            <i className="fas fa-undo me-1"></i>Revert
                                                        </button>
                                                    </div>
                                                )}
                                                {activeTab === 'rejected' && (
                                                    <div>
                                                        <div className="text-danger mb-1">
                                                            <i className="fas fa-times-circle me-1"></i>
                                                            Rejected
                                                        </div>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning" 
                                                            onClick={() => handleUpdateStatus(reg.id, 'pending')}
                                                            title="Revert to pending status"
                                                        >
                                                            <i className="fas fa-undo me-1"></i>Revert
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted">
                                            No matching records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllRegistrationsView;
