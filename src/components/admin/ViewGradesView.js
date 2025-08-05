import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getToken } from '../../utils/api';

function ViewGradesView() {
    const [gradingData, setGradingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGradingData();
    }, []);

    const fetchGradingData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/grades`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGradingData(data);
            } else {
                console.error('Failed to fetch grading data');
                setGradingData([]);
            }
        } catch (error) {
            console.error('Error fetching grading data:', error);
            setGradingData([]);
        } finally {
            setLoading(false);
        }
    };

    // State for the entire data structure, selected teacher, and subject
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // State derived from selections
    const [subjectsForTeacher, setSubjectsForTeacher] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [students, setStudents] = useState([]);
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'admin';

    // Effect to update subjects when a teacher is selected
    useEffect(() => {
        if (selectedTeacherId) {
            const teacher = gradingData.find(t => t.id.toString() === selectedTeacherId);
            setSubjectsForTeacher(teacher ? teacher.subjects : []);
            // Reset subject and student list when teacher changes
            setSelectedSubjectId('');
            setSchedule('');
            setStudents([]);
        } else {
            // Clear everything if no teacher is selected
            setSubjectsForTeacher([]);
            setSelectedSubjectId('');
            setSchedule('');
            setStudents([]);
        }
    }, [selectedTeacherId, gradingData]);

    // Effect to update schedule and students when a subject is selected
    useEffect(() => {
        if (selectedSubjectId) {
            const subject = subjectsForTeacher.find(s => s.id.toString() === selectedSubjectId);
            if (subject) {
                setSchedule(subject.schedule);
                setStudents(subject.students);
            }
        } else {
            setSchedule('');
            setStudents([]);
        }
    }, [selectedSubjectId, subjectsForTeacher]);


    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="m-0">View Grades</h2>
                <span className="text-muted fw-bold">ADMINISTRATORS / GRADES</span>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div className="card-body">
                        {/* Filter Dropdowns */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label">Select a Teacher</label>
                                <select 
                                    className="form-select" 
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    disabled = {!isAdmin}
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {gradingData.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Select a Subject</label>
                                <select 
                                    className="form-select"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    disabled = {!isAdmin}
                                >
                                    <option value="">--- Select Subject ---</option>
                                    {subjectsForTeacher.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Select a Schedule</label>
                                <select className="form-select" value={schedule} disabled = {!isAdmin}>
                                    <option>{schedule || '-- Select Subject First --'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Grades Table */}
                        <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                            <p className="text-muted">{students.length} of {students.length}</p>
                            <table className="table table-hover">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Prelims</th>
                                        <th>Midterms</th>
                                        <th>Final Midterm Grade</th>
                                        <th>Finals</th>
                                        <th>Final Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length > 0 ? students.map(student => (
                                        <tr key={student.id}>
                                            <td>{student.studentId}</td>
                                            <td>{student.name}</td>
                                            <td>{student.prelims}</td>
                                            <td>{student.midterms}</td>
                                            <td>{student.finalMidtermGrade}</td>
                                            <td>{student.finals}</td>
                                            <td>{student.finalGrade}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted">
                                                No students found. Please select a teacher and subject first.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewGradesView;