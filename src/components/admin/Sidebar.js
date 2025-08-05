import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

function Sidebar({ onProfileClick, setStudentToEnroll }) {
    const location = useLocation();
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    
    const [isEnrollmentOpen, setEnrollmentOpen] = useState(location.pathname.startsWith('/admin/enrollment'));
    const [isRegistrationOpen, setRegistrationOpen] = useState(location.pathname.startsWith('/admin/registration'));
    const [isStudentOpen, setStudentOpen] = useState(location.pathname.startsWith('/admin/all-students') || location.pathname.startsWith('/admin/students/'));
    const [isManageOpen, setManageOpen] = useState(location.pathname.startsWith('/admin/manage'));
    const [isAssessmentOpen, setAssessmentOpen] = useState(location.pathname.startsWith('/admin/assessment'));
    
    const [profilePic, setProfilePic] = useState(null);
    const userRole = localStorage.getItem('userRole');

    const [schoolYears, setSchoolYears] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');

    useEffect(() => {
        // Fetch school years from backend
        const fetchSchoolYears = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/school-years`, {
                    headers: {
                        'Authorization': `Bearer ${getToken()}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setSchoolYears(data);
                    // Set the default selected value to the most recent one
                    if (data.length > 0) {
                        setSelectedSchoolYear(data[0].id);
                    }
                } else {
                    console.error('Failed to fetch school years');
                    setSchoolYears([]);
                }
            } catch (error) {
                console.error('Error fetching school years:', error);
                setSchoolYears([]);
            }
        };
        fetchSchoolYears();
    }, []);

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/requests`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const pendingCount = data.filter(req => req.status === 'pending').length;
                    setPendingRequestCount(pendingCount);
                }
            } catch (err) {
                console.error('Failed to fetch pending requests:', err);
            }
        };

        fetchPendingRequests();
        const interval = setInterval(fetchPendingRequests, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const savedPic = localStorage.getItem(`${userRole}ProfilePic`);
        if (savedPic) setProfilePic(savedPic);
    }, [userRole]);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-tachometer-alt' },
        { name: 'Students', icon: 'fa-users', subItems: [ { name: 'All Students', path: '/admin/all-students' }, { name: 'New Student', path: '/admin/enrollment/new' }] },
        { name: 'Registration', icon: 'fa-file-alt', subItems: [ { name: 'All Registrations', path: '/admin/all-registrations' } ] },
        { name: 'Enrollment', icon: 'fa-user-check',
            subItems: [ 
              { name: 'Unenrolled Registrations', path: '/admin/enrollment/unenrolled' }, 
              { name: 'New Enrollment', path: '/admin/enrollment/new' } 
            ] 
        },
        { name: 'Assessment', path: '/admin/assessment', icon: 'fa-clipboard-list', 
            subItems: [
                { name : 'Unassessed Student', path: '/admin/assessment/unassessed-student'},
                { name : 'View Assessment', path: '/admin/assessment/view-assessment'}
            ]
        },
        { 
          name: 'Requests', 
          path: '/admin/requests', 
          icon: 'fa-folder-open', 
          badge: pendingRequestCount 
        },
        { name: 'Manage',
          icon: 'fa-cogs',
          subItems: [
            { name: 'Subject Schedules', path: '/admin/manage/subject-schedules' },
            { name: 'School Year & Semester', path: '/admin/manage/school-year-semester' },
            { name: 'View Grades', path: '/admin/manage/view-grades' },
            { name: 'Encode Enrollments', path: '/admin/manage/encode-enrollments' }
          ]
        },
        { name: 'Accounts', path: '/admin/accounts', icon: 'fa-user-shield' }
    ];

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                setProfilePic(imageData);
                localStorage.setItem(`${userRole}ProfilePic`, imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMenuClick = (e, itemName) => {
        e.preventDefault();
        if (itemName === 'Enrollment') {
            setEnrollmentOpen(!isEnrollmentOpen);
        } else if (itemName === 'Registration') {
            setRegistrationOpen(!isRegistrationOpen);
        } else if (itemName === 'Students') {
            setStudentOpen(!isStudentOpen);
        } else if (itemName === 'Manage') {
            setManageOpen(!isManageOpen);
        } else if (itemName === 'Assessment') {
            setAssessmentOpen(!isAssessmentOpen);
        }
    };

    const handleSchoolYearChange = (e) => {
        setSelectedSchoolYear(e.target.value);
    };

    const visibleMenuItems = userRole === 'accounting'
        ? menuItems.filter(item => item.name === 'Registration')
        : userRole === 'admin'
            ? menuItems.filter(item => item.name !== 'Registration')
            : menuItems; // Show all for any other case (or default)

    return (
        <div className="sidebar">
            <div className="sidebar-header text-center">
                <div className="sidebar-profile-container">
                    <div onClick={() => profilePic && onProfileClick(profilePic)}>
                        {profilePic ? (<img src={profilePic} alt="Admin Profile" className="sidebar-profile-pic" />) : (<i className="fas fa-user-circle"></i>)}
                    </div>
                    <label htmlFor="profile-pic-upload" className="profile-pic-edit-button"><i className="fas fa-camera"></i></label>
                    <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} style={{display:'none'}}/>
                </div>
                <h5>{userRole === 'accounting' ? 'Accounting' : 'Registrar'}</h5>
            </div>
            
             {/* --- START: Added School Year Selector --- */}
            <div className="sidebar-sy-selector">
                <select 
                    className="form-select sy-dropdown"
                    value={selectedSchoolYear}
                    onChange={handleSchoolYearChange}
                >
                    {schoolYears.map(sy => (
                        <option key={sy.id} value={sy.id}>
                            SY {sy.start_year} - {sy.end_year} {sy.semester}
                        </option>
                    ))}
                </select>
            </div>

            <div className="sidebar-nav">
                <ul className="nav flex-column">
                    {visibleMenuItems.map(item => (
                        <li className="nav-item" key={item.name}>
                            {item.subItems ? (
                                <>
                                    {/* FIX: Changed 'itemName' to 'item.name' to pass the correct value */}
                                    <a href="#!" className="nav-link d-flex justify-content-between" onClick={(e) => handleMenuClick(e, item.name)}>
                                        <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                        <i className={`fas fa-chevron-down transition-transform ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'rotate-180':''}`}></i>
                                    </a>
                                    <div className={`collapse ${((item.name==='Enrollment'&&isEnrollmentOpen)||(item.name==='Registration'&&isRegistrationOpen)||(item.name==='Students'&&isStudentOpen)||(item.name==='Manage'&&isManageOpen)||(item.name==='Assessment'&&isAssessmentOpen))?'show':''}`}>
                                        <ul className="nav flex-column ps-3">
                                            {item.subItems.map(subItem => (
                                                <li className="nav-item" key={subItem.name}>
                                                    <Link 
                                                        to={subItem.path} 
                                                        className={`nav-link sub-item ${
                                                            (location.pathname === subItem.path || (subItem.path === '/admin/all-students' && location.pathname.startsWith('/admin/students/'))) 
                                                            ? 'active' 
                                                            : ''
                                                        }`} 
                                                        onClick={() => subItem.path === '/admin/enrollment/new' && setStudentToEnroll(null)}>
                                                        {subItem.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <Link to={item.path} className={`nav-link d-flex justify-content-between align-items-center ${location.pathname === item.path ? 'active' : ''}`}>
                                    <span><i className={`fas ${item.icon} me-2`}></i>{item.name}</span>
                                    {item.badge > 0 && (
                                    <span className="badge bg-danger rounded-pill small-badge">{item.badge}</span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;