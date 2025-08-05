import React from 'react';

// A helper function to process the student data and generate statistics
const processStudentData = (students) => {
  const departmentMapping = {
    'BSIT': 'College of Computer Studies',
    'BSCS': 'College of Computer Studies',
    'BSBA-HRDM': 'College of Business Administration',
    'BSED-EN': 'College of Education',
    'BS-ARCH': 'College of Architecture',
  };

  const stats = {};

  students.forEach(student => {
    const department = departmentMapping[student.course] || 'Other';
    const course = student.course;
    // For this demo, we'll assume all are "First Year".
    // This could be enhanced later if you have year level data.
    const yearLevel = 'First Year';

    // Initialize department if it doesn't exist
    if (!stats[department]) {
      stats[department] = {
        total: 0,
        courses: {}
      };
    }

    // Initialize course if it doesn't exist
    if (!stats[department].courses[course]) {
      stats[department].courses[course] = {};
    }

    // Initialize year level if it doesn't exist
    if (!stats[department].courses[course][yearLevel]) {
      stats[department].courses[course][yearLevel] = {
        male: 0,
        female: 0,
        total: 0,
      };
    }

    // Increment counts
    stats[department].total++;
    stats[department].courses[course][yearLevel].total++;
    if (student.gender.toLowerCase() === 'male') {
      stats[department].courses[course][yearLevel].male++;
    } else {
      stats[department].courses[course][yearLevel].female++;
    }
  });

  return stats;
};

function DashboardView({ enrolledStudents }) {
  const statistics = processStudentData(enrolledStudents);

  const departmentColors = {
    'College of Computer Studies': {
      primary: '#3B82F6',
      secondary: '#DBEAFE',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      icon: 'fas fa-laptop-code'
    },
    'College of Business Administration': {
      primary: '#10B981',
      secondary: '#D1FAE5',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      icon: 'fas fa-chart-line'
    },
    'College of Education': {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      icon: 'fas fa-graduation-cap'
    },
    'College of Architecture': {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      icon: 'fas fa-drafting-compass'
    },
    'Other': {
      primary: '#6B7280',
      secondary: '#F3F4F6',
      gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      icon: 'fas fa-users'
    }
  };

  const totalEnrolled = Object.values(statistics).reduce((sum, dept) => sum + dept.total, 0);
  const totalDepartments = Object.keys(statistics).length;

  return (
    <div className="dashboard-view-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <div className="title-wrapper">
            <h1 className="dashboard-title">Enrollment Analytics</h1>
            <div className="title-badge">
              <i className="fas fa-chart-line"></i>
              <span>Live Dashboard</span>
            </div>
          </div>
          <p className="dashboard-subtitle">Real-time insights into student enrollment patterns and academic distribution</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="metrics-overview">
          <div className="row g-4">
            {/* Total Students Card */}
            <div className="col-lg-3 col-md-6">
              <div className="metric-card primary-metric">
                <div className="metric-card-background"></div>
                <div className="metric-card-content">
                  <div className="metric-icon-wrapper">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="metric-details">
                    <h3 className="metric-number">{totalEnrolled}</h3>
                    <p className="metric-label">Total Enrolled</p>
                    <div className="metric-trend">
                      <i className="fas fa-arrow-up"></i>
                      <span>Active Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Cards */}
            {Object.keys(statistics).map(department => {
              const colorScheme = departmentColors[department] || departmentColors['Other'];
              return (
                <div className="col-lg-3 col-md-6" key={department}>
                  <div className="metric-card department-metric" style={{ '--accent-color': colorScheme.primary }}>
                    <div className="metric-card-content">
                      <div className="metric-icon-wrapper" style={{ backgroundColor: colorScheme.secondary, color: colorScheme.primary }}>
                        <i className={colorScheme.icon}></i>
                      </div>
                      <div className="metric-details">
                        <h3 className="metric-number">{statistics[department].total}</h3>
                        <p className="metric-label">{department}</p>
                        <div className="metric-percentage">
                          <span>{((statistics[department].total / totalEnrolled) * 100).toFixed(1)}%</span>
                          <span>of total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics Section */}
      <div className="dashboard-details-container">
        <div className="analytics-header">
          <div className="analytics-title-section">
            <h2 className="analytics-title">Course Analytics</h2>
            <p className="analytics-subtitle">Detailed breakdown by program and demographic distribution</p>
          </div>
          <div className="analytics-controls">
            <div className="view-toggle">
              <button className="toggle-btn active">
                <i className="fas fa-th-large"></i>
                <span>Grid View</span>
              </button>
              <button className="toggle-btn">
                <i className="fas fa-list"></i>
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          {Object.keys(statistics).map(department => {
            const colorScheme = departmentColors[department] || departmentColors['Other'];
            return (
              Object.keys(statistics[department].courses).map(course => (
                <div className="analytics-card" key={course}>
                  <div className="card-header-section" style={{ background: colorScheme.gradient }}>
                    <div className="header-content">
                      <div className="course-info">
                        <h5 className="course-name">{course}</h5>
                        <span className="department-tag" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                          {department}
                        </span>
                      </div>
                      <div className="header-icon">
                        <i className={colorScheme.icon}></i>
                      </div>
                    </div>
                    <div className="enrollment-summary">
                      <div className="summary-item">
                        <span className="summary-number">
                          {Object.values(statistics[department].courses[course]).reduce((sum, year) => sum + year.total, 0)}
                        </span>
                        <span className="summary-label">Total Students</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-body-section">
                    {Object.keys(statistics[department].courses[course]).map(yearLevel => (
                      <div key={yearLevel} className="year-analytics">
                        <div className="year-header">
                          <h6 className="year-title">{yearLevel}</h6>
                          <div className="year-stats">
                            <span className="stat-badge total">
                              {statistics[department].courses[course][yearLevel].total} Total
                            </span>
                          </div>
                        </div>
                        
                        <div className="demographics-grid">
                          <div className="demo-item male">
                            <div className="demo-icon">
                              <i className="fas fa-male"></i>
                            </div>
                            <div className="demo-content">
                              <span className="demo-number">{statistics[department].courses[course][yearLevel].male}</span>
                              <span className="demo-label">Male</span>
                            </div>
                            <div className="demo-percentage">
                              {statistics[department].courses[course][yearLevel].total > 0 ? 
                                ((statistics[department].courses[course][yearLevel].male / statistics[department].courses[course][yearLevel].total) * 100).toFixed(1) : 0}%
                            </div>
                          </div>
                          
                          <div className="demo-item female">
                            <div className="demo-icon">
                              <i className="fas fa-female"></i>
                            </div>
                            <div className="demo-content">
                              <span className="demo-number">{statistics[department].courses[course][yearLevel].female}</span>
                              <span className="demo-label">Female</span>
                            </div>
                            <div className="demo-percentage">
                              {statistics[department].courses[course][yearLevel].total > 0 ? 
                                ((statistics[department].courses[course][yearLevel].female / statistics[department].courses[course][yearLevel].total) * 100).toFixed(1) : 0}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill male-fill" 
                              style={{ 
                                width: `${statistics[department].courses[course][yearLevel].total > 0 ? 
                                  (statistics[department].courses[course][yearLevel].male / statistics[department].courses[course][yearLevel].total) * 100 : 0}%` 
                              }}
                            ></div>
                            <div 
                              className="progress-fill female-fill" 
                              style={{ 
                                width: `${statistics[department].courses[course][yearLevel].total > 0 ? 
                                  (statistics[department].courses[course][yearLevel].female / statistics[department].courses[course][yearLevel].total) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            );
          })}
        </div>

        {/* Empty State */}
        {Object.keys(statistics).length === 0 && (
          <div className="modern-empty-state">
            <div className="empty-illustration">
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="empty-content">
              <h3 className="empty-title">No Enrollment Data Available</h3>
              <p className="empty-description">
                Enrollment analytics will appear here once students have been registered in the system.
              </p>
              <div className="empty-actions">
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i>
                  Add Students
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardView;