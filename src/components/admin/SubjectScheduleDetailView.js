import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL, getToken } from '../../utils/api';

// Helper function (no changes needed here)
const generateEnrolledStudents = (count) => {
    const students = [];
    const firstNames = ["Juan", "Maria", "Jose", "Anna", "Luis", "Sofia", "Carlos", "Isabella", "Miguel", "Camila", "John", "Jane", "Peter", "Mary", "James", "Patricia"];
    const lastNames = ["Dela Cruz", "Garcia", "Reyes", "Santos", "Ramos", "Mendoza", "Gonzales", "Flores", "Villanueva", "Lim", "Tan", "Lee", "Kim", "Park"];
    const courses = ["BSIT", "BSCS", "BSBA-MKTG", "BSBA-HRDM", "BSED-EN", "BS-ARCH", "BSHM"];
    const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

    for (let i = 0; i < count; i++) {
        const studentId = `2022-00${100 + i}`.slice(-6);
        students.push({
            id: studentId,
            name: `${lastNames[i % lastNames.length]}, ${firstNames[i % firstNames.length]}`,
            gender: i % 2 === 0 ? 'Male' : 'Female',
            course: courses[i % courses.length],
            year: yearLevels[i % yearLevels.length],
            enrollmentDate: new Date(2025, 4, 27 - i).toLocaleDateString()
        });
    }
    return students;
}

function SubjectScheduleDetailView() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const token = getToken();
                const response = await fetch(`${API_BASE_URL}/api/schedules/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSchedule(data);
            } catch (err) {
                setError(err);
                console.error("Error fetching schedule:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [id]);

    if (loading) {
        return <div className="detail-view-wrapper"><h2>Loading schedule...</h2></div>;
    }

    if (error) {
        return <div className="detail-view-wrapper"><h2>Error: {error.message}</h2></div>;
    }

    if (!schedule) {
        return <div className="detail-view-wrapper"><h2>Schedule not found.</h2></div>;
    }

    const enrolledStudents = generateEnrolledStudents(schedule.enrollees);

    return (
        <div className="detail-view-wrapper">
            
            {/* START: Added sticky container */}
            <p>Schedule Details</p>
            <div className="sticky-header">
                {/* Schedule Info Section */}
                <div className="info-section">
                    <div className="info-column">
                        <p><strong>Subject:</strong> {schedule.subject}</p>
                        <p><strong>Description:</strong> {schedule.description}</p>
                        <p><strong>Schedule:</strong> {schedule.days} {schedule.time}</p>
                    </div>
                    <div className="info-column">
                        <p><strong>Teacher:</strong> {schedule.teacher}</p>
                        <p><strong>Total Students:</strong> {schedule.enrollees}</p>
                        <p><strong>Room:</strong> {schedule.room}</p>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="controls-section">
                    <select className="custom-select">
                        <option>Student List</option>
                    </select>
                    <select className="custom-select">
                        <option>Enrolled and Assessed</option>
                        <option>Enrolled Only</option>
                    </select>
                    <div className="button-group">
                        <button className="action-button">Export</button>
                        <button className="action-button">Print</button>
                    </div>
                </div>
            </div>
            {/* END: Added sticky container */}


            {/* Students Table Section (This part will now scroll under the sticky header) */}
            <div className="table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Course</th>
                            <th>Year Level</th>
                            <th>Enrollment Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrolledStudents.length > 0 ? enrolledStudents.map((student, index) => (
                            <tr key={index}>
                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                <td>{student.gender}</td>
                                <td>{student.course}</td>
                                <td>{student.year}</td>
                                <td>{student.enrollmentDate}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>
                                    No students enrolled in this schedule.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SubjectScheduleDetailView;