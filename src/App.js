import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { API_BASE_URL, getToken } from './utils/api';

// Import components
import Login from './components/auth/Login';
import StudentRequestForm from './components/student/StudentRequestForm';
import StudentRequestTable from './components/student/StudentRequestTable';
import StudentHomePage from './components/student/StudentHomePage';
import Sidebar from './components/admin/Sidebar';
import AllRegistrationsView from './components/admin/AllRegistrationsView';
import UnenrolledRegistrationsView from './components/admin/UnenrolledRegistrationsView';
import NewEnrollmentView from './components/admin/NewEnrollmentView';
import RequestManagementView from './components/admin/RequestManagementView';
import ImageViewModal from './components/common/ImageViewModal';
import DocumentViewModal from './components/common/DocumentViewModal';
import AllStudentsView from './components/admin/AllStudentsView';
import StudentDetailView from './components/admin/StudentDetailView';
import EditStudentView from './components/admin/EditStudentView';
import DashboardView from './components/admin/DashboardView';
import SubjectSchedulesView from './components/admin/SubjectSchedulesView';
import ScheduleDetailsView from './components/admin/ScheduleDetailsView';
import SchoolYearSemesterView from './components/admin/SchoolYearSemesterView';
import ViewGradesView from './components/admin/ViewGradesView';
import EncodeEnrollmentView from './components/admin/EncodeEnrollmentView';
import UnassessedStudentView from './components/admin/UnassessedStudentView';
import ViewAssessmentView from './components/admin/ViewAssessmentView'
import SubjectScheduleDetailView  from './components/admin/SubjectScheduleDetailView';
import AccountManagementView from './components/admin/AccountManagementView';
import NotificationBell from './components/common/NotificationBell'; // <<<--- IMPORT THIS

// Import utils
import { getUserRole } from './utils/api';

const AdminLayout = ({ onProfileClick, setStudentToEnroll }) => (
  <div className="admin-layout">
    <Sidebar onProfileClick={onProfileClick} setStudentToEnroll={setStudentToEnroll} />
    <main className="main-content">
      <Outlet />
    </main>
  </div>
);

function App() {
  const [userRole, setUserRole] = useState(getUserRole());
  const [modalImage, setModalImage] = useState(null);
  const [documentModalData, setDocumentModalData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [studentToEnroll, setStudentToEnroll] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [assessment, setAssessment] = useState([]);

  const navigate = useNavigate();

  // Function to fetch students from backend
  const fetchStudents = async () => {
    try {
      console.log('Fetching students from backend...'); // Debug log
      console.log('API_BASE_URL:', API_BASE_URL); // Debug log
      console.log('Token:', getToken() ? 'Token exists' : 'No token'); // Debug log
      
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log

      if (response.ok) {
        const students = await response.json();
        console.log('Raw students data from backend:', students); // Debug log
        console.log('Number of students returned:', students.length); // Debug log
        
        // Transform the data to match the frontend format
        const transformedStudents = students.map(student => ({
          id: student.id,
          idNo: student.idNumber,
          name: student.fullName || `${student.firstName} ${student.lastName}`,
          gender: student.gender || 'N/A',
          course: student.course || 'Not registered',
          status: student.isRegistered ? 'Registered' : 'Not registered',
          createdAt: new Date(student.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          academicStatus: student.academicStatus || 'Not registered'
        }));
        console.log('Transformed students data:', transformedStudents); // Debug log
        setEnrolledStudents(transformedStudents);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch students:', response.status, response.statusText);
        console.error('Error response:', errorText);
        
        // Add some dummy data for testing when backend is not available
        const dummyStudents = [
          {
            id: 1,
            idNo: '2024-1001',
            name: 'John Doe',
            gender: 'Male',
            course: 'BSIT',
            status: 'Registered',
            createdAt: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            academicStatus: 'Registered'
          },
          {
            id: 2,
            idNo: '2024-1002',
            name: 'Jane Smith',
            gender: 'Female',
            course: 'BSCS',
            status: 'Registered',
            createdAt: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            academicStatus: 'Registered'
          }
        ];
        console.log('Using dummy students for testing');
        setEnrolledStudents(dummyStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error details:', error.message);
    }
  };

  // Function to fetch registrations from backend
  const fetchRegistrations = async () => {
    try {
      console.log('Fetching registrations from backend...');
      
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const registrationsData = await response.json();
        console.log('Raw registrations data from backend:', registrationsData);
        setRegistrations(registrationsData);
      } else {
        console.error('Failed to fetch registrations:', response.status, response.statusText);
        // Keep empty array if backend fails
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      // Keep empty array if network fails
      setRegistrations([]);
    }
  };

  useEffect(() => {
    const role = getUserRole();
    if (role) {
      setUserRole(role);
      if (role === 'admin' || role === 'accounting') {
        fetchStudents(); // Fetch students only for admin/accounting
        fetchRegistrations(); // Fetch registrations for admin/accounting
      }
    } else {
       document.body.classList.add('login-background');
    }
    return () => {
        document.body.classList.remove('login-background');
    };
  }, [userRole]);

  useEffect(() => {
    if (modalImage || documentModalData) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [modalImage, documentModalData]);

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    if (role === 'admin') {
      navigate('/admin/dashboard');
      fetchStudents(); // Fetch students when admin logs in
      fetchRegistrations(); // Fetch registrations when admin logs in
    } else if (role === 'accounting') {
        navigate('/admin/all-registrations');
        fetchStudents(); // Fetch students when accounting logs in
        fetchRegistrations(); // Fetch registrations when accounting logs in
    } else if (role === 'student') {
      navigate('/student/home');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('idNumber');
      setUserRole(null);
      navigate('/login');
  };

  const handleCompleteEnrollment = (enrolledStudent) => {
    const newStudent = {
      ...enrolledStudent,
      id: enrolledStudents.length + 1,
      idNo: `2024-${1000 + enrolledStudents.length + 1}`,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setEnrolledStudents(prev => [...prev, newStudent]);

    setRegistrations(prev => prev.map(reg =>
      reg.id === enrolledStudent.id ? { ...reg, status: 'enrolled' } : reg
    ));

    setStudentToEnroll(null);
    navigate('/admin/all-students');
    alert('Enrollment Complete! Student has been added to the master list.');
    
    // Refresh the students list from backend
    setTimeout(() => {
      fetchStudents();
    }, 1000);
  };

  const handleEncodeStudent = (encodedStudent) => {
    const newStudent = {
      ...encodedStudent,
      idNo: encodedStudent.id,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    setEnrolledStudents(prev => {
        const isAlreadyEnrolled = prev.some(s => s.idNo === newStudent.idNo);
        if (isAlreadyEnrolled) {
            alert(`Student ${newStudent.name} is already in the master list.`);
            return prev;
        }
        alert(`Successfully encoded and added ${newStudent.name} to the All Students list.`);
        return [...prev, newStudent];
    });
    
    // Refresh the students list from backend
    setTimeout(() => {
      fetchStudents();
    }, 1000);
  };

  // Function to refresh student list
  const refreshStudents = () => {
    fetchStudents();
  };

  const closeDocumentModal = () => {
    setDocumentModalData(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!userRole) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  
  const logoStyle = {
    marginLeft: (userRole === 'admin' || userRole === 'accounting') ? '18%' : '0'
  };

  return (
    <div id="app-wrapper">
        {/* Student Navbar */}
        {userRole === 'student' && (
          <nav className="navbar navbar-expand-lg navbar-dark fixed-top navbar-custom-gradient shadow-sm" style={{ minHeight: '60px', zIndex: 1040 }}>
            <div className="container-fluid align-items-center">
              <div className="logo-container">
                <img src="/benedicto2.png" className="logo-navbar" style={logoStyle} alt="Benedicto College Logo" />
              </div>
              <ul className="navbar-nav flex-row ms-3" style={{ gap: '0px' }}>
                <li className="nav-item">
                  <button
                    className={`student-navbar-btn${window.location.pathname === '/student/home' ? ' active' : ''}`}
                    onClick={() => navigate('/student/home')}
                  >Home</button>
                </li>
                <li className="nav-item">
                  <button
                    className={`student-navbar-btn${window.location.pathname === '/student/request' ? ' active' : ''}`}
                    onClick={() => navigate('/student/request')}
                  >Request</button>
                </li>
                <li className="nav-item">
                  <button
                    className={`student-navbar-btn${window.location.pathname === '/student/my-request' ? ' active' : ''}`}
                    onClick={() => navigate('/student/my-request')}
                  >My Request</button>
                </li>
              </ul>
              <div className="ms-auto d-flex align-items-center">
                
                {/* --- Add the NotificationBell here --- */}
                <NotificationBell />
                
                {/* Profile Dropdown */}
                <div className="dropdown me-3">
                  <button
                    className="btn btn-link dropdown-toggle p-0 border-0 bg-transparent text-white"
                    type="button"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ outline: 'none', boxShadow: 'none', color: '#fff' }}
                  >
                    <img
                      src={localStorage.getItem('profileImage') || '/bc.png'}
                      alt="Profile"
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', background: '#eee' }}
                    />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                    <li>
                      <button className="dropdown-item" onClick={() => navigate('/student/profile')}>
                        <i className="fa-regular fa-user me-2"></i>
                        Profile
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket fa-sm me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Admin/Accounting Navbar */}
        {(userRole === 'admin' || userRole === 'accounting') && (
          <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${userRole ? 'navbar-custom-gradient shadow-sm' : ''}`}>
            <div className="container-fluid">
              <div className="logo-container">
                <img src="/benedicto2.png" className="logo-navbar" style={logoStyle} alt="Benedicto College Logo" />
              </div>
              <div className="d-flex ms-auto align-items-center">
                <span className="navbar-text me-3">
                  Logged in as: <strong>{localStorage.getItem('idNumber')}</strong> ({userRole})
                </span>
                <div className="dropdown">
                  <button
                    className="btn btn-link dropdown-toggle text-white"
                    type="button"
                    id="settingsDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fa-solid fa-gear fa-lg"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="settingsDropdown">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fa-solid fa-sliders fa-sm me-2"></i>
                        Settings
                      </button>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket fa-sm me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        )}
        <div className="content-wrapper" style={userRole === 'student' ? { marginTop: '70px' } : {}}>
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

            <Route path="/student/home" element={<ProtectedRoute><StudentHomePage /></ProtectedRoute>} />
            <Route path="/student/request" element={<ProtectedRoute><StudentRequestForm /></ProtectedRoute>} />
            <Route path="/student/my-request" element={<ProtectedRoute><StudentRequestTable /></ProtectedRoute>} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout onProfileClick={setModalImage} setStudentToEnroll={setStudentToEnroll} />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardView enrolledStudents={enrolledStudents} />} />
              <Route path="all-students" element={<AllStudentsView enrolledStudents={enrolledStudents} />} />
              <Route path="students/:idNo" element={<StudentDetailView enrolledStudents={enrolledStudents} />} />
              <Route path="students/:idNo/edit" element={<EditStudentView enrolledStudents={enrolledStudents} refreshStudents={refreshStudents} />} />
              <Route path="all-registrations" element={<AllRegistrationsView registrations={registrations} setRegistrations={setRegistrations} />} />
              <Route
                path="enrollment/unenrolled"
                element={<UnenrolledRegistrationsView registrations={registrations} onEnrollStudent={setStudentToEnroll} />}
              />
              <Route path="enrollment/new" element={<NewEnrollmentView student={studentToEnroll} onCompleteEnrollment={handleCompleteEnrollment} registrations={registrations} setStudentToEnroll={setStudentToEnroll} />} />
              
              <Route path="requests" element={<RequestManagementView setDocumentModalData={setDocumentModalData} />} />
              
              <Route path="assessment/unassessed-student" element={<UnassessedStudentView assessment={assessment} onAssessedStudent={setAssessment}/>} />
              <Route path="assessment/view-assessment" element={<ViewAssessmentView/>} />

              <Route path="manage/subject-schedules" element={<SubjectSchedulesView />} />
              <Route path="/admin/manage/subject-schedules/:id" element={<ProtectedRoute><SubjectScheduleDetailView /></ProtectedRoute>}/>
              <Route path="accounts" element={<AccountManagementView />} />
              <Route path="manage/subject-schedules/:id" element={<ScheduleDetailsView />} />
              <Route path="manage/school-year-semester" element={<SchoolYearSemesterView />} />
              <Route path="manage/view-grades" element={<ViewGradesView />} />
              <Route path="manage/encode-enrollments" element={<EncodeEnrollmentView onEncodeStudent={handleEncodeStudent} />} />
            </Route>

            <Route path="*" element={<Navigate to={
                userRole === 'admin' ? '/admin/dashboard' :
                userRole === 'accounting' ? '/admin/all-registrations' :
                userRole === 'student' ? '/student/home' :
                '/login'
              } replace />} 
            />
          </Routes>
        </div>
        {modalImage && <ImageViewModal imageUrl={modalImage} onClose={() => setModalImage(null)} />}
        {documentModalData && <DocumentViewModal modalData={documentModalData} onClose={closeDocumentModal} />}
      </div>
  );
}

export default App;
