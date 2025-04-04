// Course Management
class CourseManager {
    static async getCourses() {
        try {
            const response = await fetch('/api/courses');
            return await response.json();
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    }

    static updateProgress(courseId, progress) {
        const circle = document.querySelector(`#course-${courseId} .progress-ring circle:last-child`);
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }

    static continueCourse(courseId) {
        // Save current progress
        localStorage.setItem(`course-${courseId}-lastAccess`, new Date().toISOString());
        // Redirect to course page
        window.location.href = `/course/${courseId}`;
    }
}

// Learning Activity Chart
class LearningActivityChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.chart = null;
        this.initChart();
    }

    async initChart() {
        const ctx = this.canvas.getContext('2d');
        const data = await this.getLearningData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan'],
                datasets: [
                    {
                        label: 'Materials',
                        data: data.materials,
                        borderColor: '#7C3AED',
                        tension: 0.4
                    },
                    {
                        label: 'Exams',
                        data: data.exams,
                        borderColor: '#EC4899',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    async getLearningData() {
        // This would normally fetch from an API
        return {
            materials: [65, 75, 70, 80, 75, 85],
            exams: [60, 70, 65, 75, 70, 80]
        };
    }

    updateSemester(semester) {
        // Update chart data based on selected semester
        this.chart.update();
    }
}

// Points System
class PointsSystem {
    static async collectPoints() {
        try {
            const response = await fetch('/api/points/collect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                this.updatePointsDisplay(data.points);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error collecting points:', error);
            return false;
        }
    }

    static updatePointsDisplay(points) {
        const pointsDisplay = document.querySelector('.points-display');
        if (pointsDisplay) {
            pointsDisplay.textContent = points;
        }
    }
}

// Profile Management
class ProfileManager {
    static async getUserProfile() {
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    static async updateProfile(profileData) {
        try {
            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    static async getAcademicProgress(semester = 'current') {
        try {
            const response = await fetch(`/api/academic/progress?semester=${semester}`);
            if (!response.ok) throw new Error('Failed to fetch academic progress');
            return await response.json();
        } catch (error) {
            console.error('Error fetching academic progress:', error);
            return [];
        }
    }

    static async getAttendance() {
        try {
            const response = await fetch('/api/attendance');
            if (!response.ok) throw new Error('Failed to fetch attendance');
            return await response.json();
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return null;
        }
    }
}

// Document Management
class DocumentManager {
    static async getRecentDocuments() {
        try {
            const response = await fetch('/api/documents/recent');
            if (!response.ok) throw new Error('Failed to fetch documents');
            return await response.json();
        } catch (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
    }

    static async uploadDocument(formData) {
        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to upload document');
            return await response.json();
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }

    static async downloadDocument(documentId) {
        try {
            const response = await fetch(`/api/documents/${documentId}/download`);
            if (!response.ok) throw new Error('Failed to download document');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'document';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    }

    static async deleteDocument(documentId) {
        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete document');
            return await response.json();
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    static async downloadTranscript() {
        try {
            const response = await fetch('/api/documents/transcript');
            if (!response.ok) throw new Error('Failed to download transcript');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcript.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading transcript:', error);
            throw error;
        }
    }
}

// Assignment Manager
class AssignmentManager {
    static async getUpcomingAssignments() {
        try {
            const response = await fetch('/api/assignments/upcoming');
            if (!response.ok) throw new Error('Failed to fetch upcoming assignments');
            return await response.json();
        } catch (error) {
            console.error('Error fetching upcoming assignments:', error);
            return [];
        }
    }

    static async getAllAssignments() {
        try {
            const response = await fetch('/api/assignments/all');
            if (!response.ok) throw new Error('Failed to fetch all assignments');
            return await response.json();
        } catch (error) {
            console.error('Error fetching all assignments:', error);
            return [];
        }
    }

    static async submitAssignment(assignmentId, formData) {
        try {
            const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Failed to submit assignment');
            return await response.json();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            throw error;
        }
    }

    static async viewFeedback(assignmentId) {
        try {
            const response = await fetch(`/api/assignments/${assignmentId}/feedback`);
            if (!response.ok) throw new Error('Failed to fetch feedback');
            const feedback = await response.json();
            return feedback;
        } catch (error) {
            console.error('Error fetching feedback:', error);
            throw error;
        }
    }

    static async filterAssignments(course, status) {
        try {
            const params = new URLSearchParams();
            if (course) params.append('course', course);
            if (status) params.append('status', status);

            const response = await fetch(`/api/assignments/filter?${params}`);
            if (!response.ok) throw new Error('Failed to filter assignments');
            return await response.json();
        } catch (error) {
            console.error('Error filtering assignments:', error);
            return [];
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize learning activity chart
    const chart = new LearningActivityChart('learningChart');

    // Course progress updates
    document.querySelectorAll('.course-card').forEach(card => {
        const courseId = card.dataset.courseId;
        const progress = parseInt(card.dataset.progress);
        CourseManager.updateProgress(courseId, progress);
    });

    // Points collection button
    const collectPointsBtn = document.querySelector('.collect-points-btn');
    if (collectPointsBtn) {
        collectPointsBtn.addEventListener('click', async () => {
            const success = await PointsSystem.collectPoints();
            if (success) {
                alert('Points collected successfully!');
            }
        });
    }

    // Profile form submission
    const profileForm = document.querySelector('#profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const data = Object.fromEntries(formData.entries());
            const result = await ProfileManager.updateProfile(data);
            if (result.success) {
                alert('Profile updated successfully!');
            } else {
                alert(result.message);
            }
        });
    }

    // Semester selection
    const semesterSelect = document.querySelector('#semesterSelect');
    if (semesterSelect) {
        semesterSelect.addEventListener('change', (e) => {
            chart.updateSemester(e.target.value);
        });
    }

    // Transcript download
    const downloadTranscriptBtn = document.querySelector('.download-transcript-btn');
    if (downloadTranscriptBtn) {
        downloadTranscriptBtn.addEventListener('click', () => {
            DocumentManager.downloadTranscript();
        });
    }
});

// Export classes for use in other files
export {
    CourseManager,
    LearningActivityChart,
    PointsSystem,
    ProfileManager,
    DocumentManager,
    AssignmentManager
}; 