import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function EnrollmentApplicationsView() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/enrollment-applications/status/pending_payment`, {
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

    const handleApprovePayment = async (applicationId) => {
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/api/enrollment-applications/${applicationId}/approve-payment`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notes }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh the applications list
            fetchApplications();
            setShowModal(false);
            setSelectedApplication(null);
            setNotes('');
        } catch (err) {
            setError(err.message);
            console.error("Error approving payment:", err);
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

    if (loading) {
        return <div className="text-center py-5">Loading enrollment applications...</div>;
    }

    if (error) {
        return <div className="text-center py-5 text-danger">Error: {error}</div>;
    }

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">Enrollment Applications</h2>
                <span className="text-muted">ACCOUNTING / PAYMENT REVIEW</span>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h4 className="card-title mb-0">Pending Payment Applications</h4>
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
                            <p className="text-muted">No pending payment applications</p>
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
                                        <th>Submitted Date</th>
                                        <th>Status</th>
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
                                            <td>{new Date(application.submittedAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={getStatusBadge(application.status)}>
                                                    {application.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary me-2"
                                                    onClick={() => handleViewDetails(application)}
                                                >
                                                    <i className="fas fa-eye me-1"></i> View
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprovePayment(application.id)}
                                                >
                                                    <i className="fas fa-check me-1"></i> Approve Payment
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

            {/* Modal for viewing application details */}
            {showModal && selectedApplication && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Enrollment Application Details</h5>
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
                                
                                <div className="mt-3">
                                    <h6>Selected Subjects</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Subject Code</th>
                                                    <th>Subject Name</th>
                                                    <th>Units</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedApplication.selectedSubjects?.map((subject, index) => (
                                                    <tr key={index}>
                                                        <td>{subject.code}</td>
                                                        <td>{subject.name}</td>
                                                        <td>{subject.units}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label className="form-label">Notes (Optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any notes about this application..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => handleApprovePayment(selectedApplication.id)}
                                >
                                    <i className="fas fa-check me-1"></i> Approve Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EnrollmentApplicationsView;
