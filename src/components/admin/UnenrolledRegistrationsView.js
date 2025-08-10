import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

function UnenrolledRegistrationsView() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState('approve');
    const [notes, setNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/enrollment-applications/status/pending_registrar_review`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApplications(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching enrollment applications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (applicationId) => {
        try {
            const token = getToken();
            const requestBody = {
                action: action,
                notes: notes,
                ...(action === 'reject' && { rejectionReason: rejectionReason })
            };

            const response = await fetch(`${API_BASE_URL}/api/enrollment-applications/${applicationId}/review`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh the applications list
            fetchApplications();
            setShowModal(false);
            setSelectedApplication(null);
            setNotes('');
            setRejectionReason('');
        } catch (err) {
            setError(err.message);
            console.error("Error reviewing application:", err);
        }
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'pending_payment': 'warning',
            'payment_approved': 'success',
            'pending_registrar_review': 'info',
            'approved': 'success',
            'rejected': 'danger'
        };
        return `badge bg-${statusColors[status] || 'secondary'}`;
    };

    const checkPrerequisites = (subjects) => {
        // This is a simplified prerequisite check
        // In a real system, you would check against a database of prerequisites
        const issues = [];
        
        // Example prerequisite checks
        subjects.forEach(subject => {
            if (subject.code === 'COMP 201' && !subjects.find(s => s.code === 'COMP 101')) {
                issues.push(`${subject.code} requires COMP 101 as prerequisite`);
            }
            if (subject.code === 'MATH 202' && !subjects.find(s => s.code === 'MATH 201')) {
                issues.push(`${subject.code} requires MATH 201 as prerequisite`);
            }
        });

        return issues;
    };

    const checkScheduleConflicts = (subjects) => {
        // This is a simplified conflict check
        // In a real system, you would check against actual schedule data
        const conflicts = [];
        
        // Example conflict check
        const schedules = subjects.map(subject => ({
            code: subject.code,
            days: subject.days || 'Monday, Wednesday, Friday',
            time: subject.time || '8:00 AM - 9:30 AM'
        }));

        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                if (schedules[i].days === schedules[j].days && schedules[i].time === schedules[j].time) {
                    conflicts.push(`${schedules[i].code} conflicts with ${schedules[j].code}`);
                }
            }
        }

        return conflicts;
    };

    if (loading) {
        return <div className="text-center py-5">Loading enrollment applications...</div>;
    }

    if (error) {
        return <div className="text-center py-5 text-danger">Error: {error}</div>;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Unenrolled Registrations</h2>
                <span className="text-muted">ADMIN / REGISTRAR REVIEW</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Pending Registrar Review</h4>
                    <div>
                        <button className="btn btn-outline-primary me-2">
                            <i className="fas fa-file-export me-1"></i> Export
                        </button>
                        <button className="btn btn-outline-secondary">
                            <i className="fas fa-print me-1"></i> Print
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {applications.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No applications pending registrar review</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Student Number</th>
                                        <th>Course</th>
                                        <th>Academic Year</th>
                                        <th>Semester</th>
                                        <th>Subjects Count</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map(application => (
                                        <tr key={application.id}>
                                            <td>{application.student?.fullName}</td>
                                            <td>{application.student?.studentNumber}</td>
                                            <td>{application.course?.courseName}</td>
                                            <td>{application.academicYear}</td>
                                            <td>{application.semester}</td>
                                            <td>{application.selectedSubjects?.length || 0}</td>
                                            <td>
                                                <span className="badge bg-success">Payment Approved</span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary me-2"
                                                    onClick={() => handleViewDetails(application)}
                                                >
                                                    <i className="fas fa-eye me-1"></i> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for reviewing application details */}
            {showModal && selectedApplication && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Review Enrollment Application</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6>Student Information</h6>
                                        <p><strong>Name:</strong> {selectedApplication.student?.fullName}</p>
                                        <p><strong>Student Number:</strong> {selectedApplication.student?.studentNumber}</p>
                                        <p><strong>Email:</strong> {selectedApplication.student?.email}</p>
                                        <p><strong>Contact:</strong> {selectedApplication.student?.contactNumber}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6>Course Information</h6>
                                        <p><strong>Course:</strong> {selectedApplication.course?.courseName}</p>
                                        <p><strong>Academic Year:</strong> {selectedApplication.academicYear}</p>
                                        <p><strong>Semester:</strong> {selectedApplication.semester}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4">
                                    <h6>Selected Subjects</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Subject Code</th>
                                                    <th>Subject Name</th>
                                                    <th>Units</th>
                                                    <th>Schedule</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.selectedSubjects?.map((subject, index) => (
                                                    <tr key={index}>
                                                        <td>{subject.code}</td>
                                                        <td>{subject.name}</td>
                                                        <td>{subject.units}</td>
                                                        <td>{subject.days} {subject.time}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Prerequisites and Conflicts Check */}
                                <div className="mt-4">
                                    <h6>Validation Results</h6>
                                    {(() => {
                                        const prerequisites = checkPrerequisites(selectedApplication.selectedSubjects || []);
                                        const conflicts = checkScheduleConflicts(selectedApplication.selectedSubjects || []);
                                        
                                        if (prerequisites.length === 0 && conflicts.length === 0) {
                                            return (
                                                <div className="alert alert-success">
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    No issues found. All prerequisites are met and no schedule conflicts detected.
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="alert alert-warning">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    <strong>Issues Found:</strong>
                                                    <ul className="mb-0 mt-2">
                                                        {prerequisites.map((issue, index) => (
                                                            <li key={`prereq-${index}`}>{issue}</li>
                                                        ))}
                                                        {conflicts.map((conflict, index) => (
                                                            <li key={`conflict-${index}`}>{conflict}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                <div className="mt-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label className="form-label">Review Decision</label>
                                            <select
                                                className="form-select"
                                                value={action}
                                                onChange={(e) => setAction(e.target.value)}
                                            >
                                                <option value="approve">Approve</option>
                                                <option value="reject">Reject</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <label className="form-label">Notes</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Add your review notes..."
                                        ></textarea>
                                    </div>

                                    {action === 'reject' && (
                                        <div className="mt-3">
                                            <label className="form-label">Rejection Reason</label>
                                            <textarea
                                                className="form-control"
                                                rows="2"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Please specify the reason for rejection..."
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={() => handleReview(selectedApplication.id)}
                                >
                                    <i className={`fas ${action === 'approve' ? 'fa-check' : 'fa-times'} me-1`}></i>
                                    {action === 'approve' ? 'Approve' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UnenrolledRegistrationsView;

