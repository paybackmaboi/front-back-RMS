import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AllStudentsView({ enrolledStudents }) {
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';
    const [searchTerm, setSearchTerm] = useState('');

    console.log('AllStudentsView - enrolledStudents:', enrolledStudents);
    console.log('AllStudentsView - enrolledStudents.length:', enrolledStudents.length);

    const handleViewClick = (e) => {
        if (!isAdmin) {
            e.preventDefault();
        }
    };

    const filteredStudents = enrolledStudents.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.idNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid px-4 py-3">
            {/* Modern Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1 fw-bold text-dark">Student Management</h2>
                    <p className="text-muted mb-0">Manage and view all enrolled students</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm">
                        <i className="fas fa-download me-1"></i>Export
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <i className="fas fa-plus me-1"></i>Add Student
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="text-primary mb-2">
                                <i className="fas fa-users fa-2x"></i>
                            </div>
                            <h4 className="mb-1 fw-bold">{enrolledStudents.length}</h4>
                            <p className="text-muted mb-0 small">Total Students</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="text-success mb-2">
                                <i className="fas fa-check-circle fa-2x"></i>
                            </div>
                            <h4 className="mb-1 fw-bold">
                                {enrolledStudents.filter(s => s.status === 'Registered').length}
                            </h4>
                            <p className="text-muted mb-0 small">Registered</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="text-warning mb-2">
                                <i className="fas fa-clock fa-2x"></i>
                            </div>
                            <h4 className="mb-1 fw-bold">
                                {enrolledStudents.filter(s => s.status !== 'Registered').length}
                            </h4>
                            <p className="text-muted mb-0 small">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="text-info mb-2">
                                <i className="fas fa-graduation-cap fa-2x"></i>
                            </div>
                            <h4 className="mb-1 fw-bold">
                                {new Set(enrolledStudents.map(s => s.course)).size}
                            </h4>
                            <p className="text-muted mb-0 small">Active Courses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 fw-bold text-dark">
                            <i className="fas fa-list me-2 text-primary"></i>
                            Student Directory
                        </h5>
                        <div className="d-flex gap-2">
                            <div className="input-group input-group-sm" style={{ width: '300px' }}>
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="card-body p-0">
                    <div className="table-responsive students-table-container" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                        <table className="table table-hover mb-0 students-table">
                            <thead className="table-light">
                                <tr>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">ID No.</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">Student Name</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">Gender</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">Course</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">Status</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark">Enrolled Date</th>
                                    <th className="border-0 py-3 px-3 fw-semibold text-dark text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                    <tr key={student.id} className="border-bottom">
                                        <td className="px-3 py-3">
                                            <span className="fw-semibold text-primary">{student.idNo}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="fas fa-user text-primary"></i>
                                                </div>
                                                <div>
                                                    <div className="fw-semibold text-dark">{student.name}</div>
                                                    <small className="text-muted">{student.email || 'No email'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`badge ${student.gender === 'Male' ? 'bg-info bg-opacity-10 text-info' : 'bg-pink bg-opacity-10 text-pink'}`}>
                                                <i className={`fas fa-${student.gender === 'Male' ? 'mars' : 'venus'} me-1`}></i>
                                                {student.gender}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="fw-medium text-dark">{student.course}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`badge ${student.status === 'Registered' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                                <i className={`fas fa-${student.status === 'Registered' ? 'check-circle' : 'clock'} me-1`}></i>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-muted">{student.createdAt}</span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="action-buttons-grid">
                                                <Link 
                                                    to={`/admin/students/${student.idNo}`} 
                                                    className="btn btn-sm btn-outline-info action-btn" 
                                                    title="View Details"
                                                    onClick={handleViewClick}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </Link>
                                                <Link 
                                                    to={`/admin/students/${student.idNo}/edit`} 
                                                    className="btn btn-sm btn-outline-primary action-btn" 
                                                    title="Edit Student"
                                                    onClick={handleViewClick}
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className="text-muted">
                                                <i className="fas fa-users fa-3x mb-3 opacity-50"></i>
                                                <h5 className="mb-2">No students found</h5>
                                                <p className="mb-0">No students match your search criteria.</p>
                                            </div>
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

export default AllStudentsView;