import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function SchoolYearSemesterView() {
    const [schoolYears, setSchoolYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('all');

    useEffect(() => {
        fetchSchoolYears();
    }, []);

    const fetchSchoolYears = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/school-years`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSchoolYears(data);
            } else {
                console.error('Failed to fetch school years');
                setSchoolYears([]);
            }
        } catch (error) {
            console.error('Error fetching school years:', error);
            setSchoolYears([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Current':
                return 'status-current';
            case 'Open':
                return 'status-open';
            case 'Closed':
                return 'status-closed';
            default:
                return 'status-default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Current':
                return 'fas fa-play-circle';
            case 'Open':
                return 'fas fa-clock';
            case 'Closed':
                return 'fas fa-check-circle';
            default:
                return 'fas fa-circle';
        }
    };

    const filteredSchoolYears = schoolYears.filter(sy => {
        if (selectedFilter === 'all') return true;
        return sy.status.toLowerCase() === selectedFilter.toLowerCase();
    });

    const getStats = () => {
        const total = schoolYears.length;
        const current = schoolYears.filter(sy => sy.status === 'Current').length;
        const open = schoolYears.filter(sy => sy.status === 'Open').length;
        const closed = schoolYears.filter(sy => sy.status === 'Closed').length;
        return { total, current, open, closed };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="loading-text">Loading School Years...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="school-year-container">
            {/* Professional Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="page-title">
                            <i className="fas fa-calendar-alt me-3"></i>
                            School Year & Semester
                        </h1>
                        <p className="page-subtitle">Manage academic periods and semesters</p>
                    </div>
                    <div className="header-right">
                        <button className="btn btn-primary btn-create">
                            <i className="fas fa-plus me-2"></i>
                            Create New School Year
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">
                        <i className="fas fa-calendar"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.total}</h3>
                        <p className="stat-label">Total School Years</p>
                    </div>
                </div>
                <div className="stat-card stat-current">
                    <div className="stat-icon">
                        <i className="fas fa-play-circle"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.current}</h3>
                        <p className="stat-label">Current</p>
                    </div>
                </div>
                <div className="stat-card stat-open">
                    <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.open}</h3>
                        <p className="stat-label">Open</p>
                    </div>
                </div>
                <div className="stat-card stat-closed">
                    <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-content">
                        <h3 className="stat-number">{stats.closed}</h3>
                        <p className="stat-label">Closed</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-section">
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('all')}
                    >
                        <i className="fas fa-list me-2"></i>
                        All ({stats.total})
                    </button>
                    <button 
                        className={`filter-tab ${selectedFilter === 'current' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('current')}
                    >
                        <i className="fas fa-play-circle me-2"></i>
                        Current ({stats.current})
                    </button>
                    <button 
                        className={`filter-tab ${selectedFilter === 'open' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('open')}
                    >
                        <i className="fas fa-clock me-2"></i>
                        Open ({stats.open})
                    </button>
                    <button 
                        className={`filter-tab ${selectedFilter === 'closed' ? 'active' : ''}`}
                        onClick={() => setSelectedFilter('closed')}
                    >
                        <i className="fas fa-check-circle me-2"></i>
                        Closed ({stats.closed})
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-section">
                {filteredSchoolYears.length > 0 ? (
                    <div className="school-years-grid">
                        {filteredSchoolYears.map(sy => (
                            <div key={sy.id} className="school-year-card">
                                <div className="card-header-section">
                                    <div className="school-year-info">
                                        <h3 className="school-year-title">{sy.schoolYear}</h3>
                                        <p className="semester-text">{sy.semester}</p>
                                    </div>
                                    <div className={`status-badge ${getStatusBadge(sy.status)}`}>
                                        <i className={getStatusIcon(sy.status)}></i>
                                        <span>{sy.status}</span>
                                    </div>
                                </div>
                                <div className="card-body-section">
                                    <div className="info-row">
                                        <span className="info-label">Academic Period:</span>
                                        <span className="info-value">{sy.schoolYear}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Semester:</span>
                                        <span className="info-value">{sy.semester}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Status:</span>
                                        <span className={`info-value status-text ${getStatusBadge(sy.status)}`}>
                                            {sy.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button className="btn-action btn-view" title="View Details">
                                        <i className="fas fa-eye"></i>
                                        <span>View</span>
                                    </button>
                                    <button className="btn-action btn-edit" title="Edit School Year">
                                        <i className="fas fa-pencil-alt"></i>
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3 className="empty-title">No School Years Found</h3>
                        <p className="empty-description">
                            {selectedFilter === 'all' 
                                ? "Get started by creating your first school year and semester."
                                : `No ${selectedFilter} school years found.`
                            }
                        </p>
                        <button className="btn btn-primary btn-create-empty">
                            <i className="fas fa-plus me-2"></i>
                            Create School Year
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SchoolYearSemesterView;