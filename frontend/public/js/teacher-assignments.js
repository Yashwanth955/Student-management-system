// Teacher Assignments Management Script

// Global data
let currentCourse = '';
let token = localStorage.getItem('token');

// Elements (initialized when document is ready)
let courseSelect, assignmentsList, createAssignmentBtn, assignmentModal;
let assignmentForm, assignmentTitle, assignmentDescription, assignmentCourse;
let assignmentDueDate, assignmentMaxPoints, studentCheckboxes;
let gradeModal, gradeForm, gradeAssignmentId, gradeScore, gradeFeedback;

// Get the authentication token
function getAuthHeader() {
    return {
        'Authorization': token,
        'Content-Type': 'application/json'
    };
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    courseSelect = document.getElementById('courseSelect');
    assignmentsList = document.getElementById('assignmentsList');
    createAssignmentBtn = document.getElementById('createAssignmentBtn');
    assignmentModal = document.getElementById('assignmentModal');
    assignmentForm = document.getElementById('assignmentForm');
    assignmentTitle = document.getElementById('assignmentTitle');
    assignmentDescription = document.getElementById('assignmentDescription');
    assignmentCourse = document.getElementById('assignmentCourse');
    assignmentDueDate = document.getElementById('assignmentDueDate');
    assignmentMaxPoints = document.getElementById('assignmentMaxPoints');
    studentCheckboxes = document.getElementById('studentCheckboxes');
    gradeModal = document.getElementById('gradeModal');
    gradeForm = document.getElementById('gradeForm');
    gradeAssignmentId = document.getElementById('gradeAssignmentId');
    gradeScore = document.getElementById('gradeScore');
    gradeFeedback = document.getElementById('gradeFeedback');
    
    // Set minimum due date as today
    const today = new Date();
    assignmentDueDate.min = today.toISOString().split('T')[0];

    // Event listeners for course selection
    if (courseSelect) {
        courseSelect.addEventListener('change', function() {
            currentCourse = this.value;
            if (currentCourse) {
                loadAssignments(currentCourse);
            } else {
                assignmentsList.innerHTML = '<div class="text-center py-8 text-gray-500">Select a course to view assignments</div>';
            }
        });
    }

    // Event listener for create assignment button
    if (createAssignmentBtn) {
        createAssignmentBtn.addEventListener('click', function() {
            openAssignmentModal();
        });
    }

    // Event listener for assignment form submission
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAssignment();
        });
    }

    // Event listener for grade form submission
    if (gradeForm) {
        gradeForm.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
                e.preventDefault();
                submitGrade();
            }
        });
    }

    // Load teacher's courses
    loadTeacherCourses();

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === assignmentModal) {
            closeAssignmentModal();
        }
        if (e.target === gradeModal) {
            closeGradeModal();
        }
    });

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            if (this.closest('#assignmentModal')) {
                closeAssignmentModal();
            }
            if (this.closest('#gradeModal')) {
                closeGradeModal();
            }
        });
    });
});

// Load teacher's courses for the dropdown
async function loadTeacherCourses() {
    try {
        const response = await fetch('/api/teachers/courses', {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }

        const courses = await response.json();
        
        // Clear existing options except the first one
        while (courseSelect.options.length > 1) {
            courseSelect.remove(1);
        }
        
        // Also clear assignment course select
        if (assignmentCourse) {
            while (assignmentCourse.options.length > 0) {
                assignmentCourse.remove(0);
            }
        }
        
        // Add courses to dropdowns
        courses.forEach(course => {
            // Main course select
            const option = document.createElement('option');
            option.value = course.name;
            option.textContent = `${course.name} (${course.semester})`;
            courseSelect.appendChild(option);
            
            // Assignment form course select
            if (assignmentCourse) {
                const formOption = document.createElement('option');
                formOption.value = course.name;
                formOption.textContent = `${course.name} (${course.semester})`;
                assignmentCourse.appendChild(formOption);
            }
        });
        
        // If we don't have real course data yet, add some mock data
        if (courses.length === 0) {
            addMockCourses();
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        addMockCourses();
    }
}

// Add mock courses if we don't have real data yet
function addMockCourses() {
    const mockCourses = [
        { name: 'CS201', semester: 'Fall 2023' },
        { name: 'CS301', semester: 'Fall 2023' },
        { name: 'CS401', semester: 'Fall 2023' }
    ];
    
    mockCourses.forEach(course => {
        // Main course select
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = `${course.name} (${course.semester})`;
        courseSelect.appendChild(option);
        
        // Assignment form course select
        if (assignmentCourse) {
            const formOption = document.createElement('option');
            formOption.value = course.name;
            formOption.textContent = `${course.name} (${course.semester})`;
            assignmentCourse.appendChild(formOption);
        }
    });
}

// Load assignments for a specific course
async function loadAssignments(courseCode) {
    try {
        assignmentsList.innerHTML = '<div class="text-center py-8"><div class="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full"></div><p class="mt-2 text-gray-600">Loading assignments...</p></div>';
        
        const response = await fetch(`/api/assignments/course/${courseCode}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch assignments');
        }

        const data = await response.json();
        
        if (!data.success || !data.assignments || data.assignments.length === 0) {
            assignmentsList.innerHTML = '<div class="text-center py-8 text-gray-500">No assignments found for this course</div>';
            return;
        }
        
        // Group assignments by status
        const grouped = {
            upcoming: [],
            submitted: [],
            completed: [],
            overdue: []
        };
        
        data.assignments.forEach(assignment => {
            if (grouped[assignment.status]) {
                grouped[assignment.status].push(assignment);
            } else {
                grouped.upcoming.push(assignment);
            }
        });
        
        // Create HTML for assignments
        let html = '';
        
        // Function to create assignment card
        const createAssignmentCard = (assignment) => {
            const dueDate = new Date(assignment.dueDate).toLocaleDateString();
            const studentName = assignment.student ? assignment.student.personalInfo.fullName : 'Unknown Student';
            const studentId = assignment.student ? assignment.student.studentId : 'Unknown ID';
            const statusClass = 
                assignment.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                assignment.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800';
            
            return `
                <div class="bg-white rounded-lg shadow-md p-4 mb-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${assignment.title}</h3>
                            <p class="text-sm text-gray-600 mt-1">Due: ${dueDate}</p>
                            <p class="text-sm mt-2">
                                <span class="font-medium">Student:</span> 
                                <a href="student_profile.html?id=${studentId}" class="text-purple-600 hover:underline">${studentName}</a>
                            </p>
                            ${assignment.score !== undefined ? 
                                `<p class="text-sm mt-1"><span class="font-medium">Score:</span> ${assignment.score}/${assignment.maxPoints}</p>` : ''}
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full ${statusClass} capitalize">${assignment.status}</span>
                    </div>
                    ${assignment.description ? `<p class="text-sm text-gray-700 mt-3">${assignment.description}</p>` : ''}
                    <div class="mt-4 flex justify-end space-x-2">
                        ${assignment.status === 'submitted' ? 
                            `<button onclick="openGradeModal('${assignment._id}')" class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                <i class="fas fa-check-circle mr-1"></i> Grade
                            </button>` : ''}
                        ${assignment.status === 'completed' ? 
                            `<button onclick="openGradeModal('${assignment._id}')" class="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                                <i class="fas fa-edit mr-1"></i> Update Grade
                            </button>` : ''}
                        <button onclick="viewAssignmentDetails('${assignment._id}')" class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
                            <i class="fas fa-eye mr-1"></i> View
                        </button>
                    </div>
                </div>
            `;
        };
        
        // Pending/Submitted assignments
        if (grouped.submitted.length > 0) {
            html += `
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3 text-purple-800">Pending Grading (${grouped.submitted.length})</h2>
                    <div class="space-y-4">
                        ${grouped.submitted.map(createAssignmentCard).join('')}
                    </div>
                </div>
            `;
        }
        
        // Upcoming assignments
        if (grouped.upcoming.length > 0) {
            html += `
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3 text-blue-800">Upcoming (${grouped.upcoming.length})</h2>
                    <div class="space-y-4">
                        ${grouped.upcoming.map(createAssignmentCard).join('')}
                    </div>
                </div>
            `;
        }
        
        // Completed assignments
        if (grouped.completed.length > 0) {
            html += `
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3 text-green-800">Graded (${grouped.completed.length})</h2>
                    <div class="space-y-4">
                        ${grouped.completed.map(createAssignmentCard).join('')}
                    </div>
                </div>
            `;
        }
        
        // Overdue assignments
        if (grouped.overdue && grouped.overdue.length > 0) {
            html += `
                <div class="mb-6">
                    <h2 class="text-lg font-semibold mb-3 text-red-800">Overdue (${grouped.overdue.length})</h2>
                    <div class="space-y-4">
                        ${grouped.overdue.map(createAssignmentCard).join('')}
                    </div>
                </div>
            `;
        }
        
        assignmentsList.innerHTML = html;
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsList.innerHTML = '<div class="text-center py-8 text-red-500">Error loading assignments. Please try again later.</div>';
    }
}

// Load students for the selected course
async function loadStudentsForCourse(courseCode) {
    try {
        studentCheckboxes.innerHTML = '<div class="text-center py-4"><div class="animate-spin inline-block w-6 h-6 border-4 border-gray-300 border-t-purple-600 rounded-full"></div></div>';
        
        // In a real implementation, this would fetch students from the API
        // For now, let's use mock data
        const mockStudents = {
            'CS201': [
                { id: 'CS2023001', name: 'John Doe' },
                { id: 'CS2023002', name: 'Jane Smith' },
                { id: 'CS2023003', name: 'Alex Johnson' },
                { id: 'CS2023004', name: 'Emily Brown' },
                { id: 'CS2023005', name: 'Michael Wilson' }
            ],
            'CS301': [
                { id: 'CS2022001', name: 'Robert Chen' },
                { id: 'CS2022002', name: 'Sarah Garcia' },
                { id: 'CS2022003', name: 'David Kim' },
                { id: 'CS2022004', name: 'Lisa Wang' }
            ],
            'CS401': [
                { id: 'CS2021001', name: 'James Taylor' },
                { id: 'CS2021002', name: 'Maria Martinez' },
                { id: 'CS2021003', name: 'Thomas Lee' }
            ]
        };
        
        // Generate checkboxes for students
        let html = '';
        const students = mockStudents[courseCode] || [];
        
        if (students.length === 0) {
            html = '<p class="text-sm text-gray-500 py-2">No students found for this course.</p>';
        } else {
            html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-2">';
            students.forEach(student => {
                html += `
                    <div class="flex items-center">
                        <input type="checkbox" id="student-${student.id}" name="studentIds" value="${student.id}" class="h-4 w-4 text-purple-600 focus:ring-purple-500">
                        <label for="student-${student.id}" class="ml-2 text-sm text-gray-700">${student.name} (${student.id})</label>
                    </div>
                `;
            });
            html += '</div>';
            html += `
                <div class="mt-2 flex items-center">
                    <button type="button" id="selectAllStudents" class="text-xs text-purple-600 hover:text-purple-800">Select All</button>
                    <span class="mx-2 text-gray-400">|</span>
                    <button type="button" id="deselectAllStudents" class="text-xs text-purple-600 hover:text-purple-800">Deselect All</button>
                </div>
            `;
        }
        
        studentCheckboxes.innerHTML = html;
        
        // Add event listeners for select/deselect all
        const selectAllBtn = document.getElementById('selectAllStudents');
        const deselectAllBtn = document.getElementById('deselectAllStudents');
        
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', function() {
                document.querySelectorAll('input[name="studentIds"]').forEach(checkbox => {
                    checkbox.checked = true;
                });
            });
        }
        
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', function() {
                document.querySelectorAll('input[name="studentIds"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
            });
        }
    } catch (error) {
        console.error('Error loading students:', error);
        studentCheckboxes.innerHTML = '<p class="text-sm text-red-500 py-2">Error loading students. Please try again.</p>';
    }
}

// Open assignment creation modal
function openAssignmentModal() {
    // Reset form
    assignmentForm.reset();
    
    // Set current course as selected option
    if (currentCourse && assignmentCourse) {
        assignmentCourse.value = currentCourse;
        loadStudentsForCourse(currentCourse);
    }
    
    // Show modal
    assignmentModal.classList.remove('hidden');
}

// Close assignment creation modal
function closeAssignmentModal() {
    assignmentModal.classList.add('hidden');
}

// Submit new assignment
async function submitAssignment() {
    try {
        // Collect selected student IDs
        const selectedStudents = Array.from(
            document.querySelectorAll('input[name="studentIds"]:checked')
        ).map(checkbox => checkbox.value);
        
        if (selectedStudents.length === 0) {
            showNotification('Please select at least one student', 'error');
            return;
        }
        
        // Collect form data
        const formData = {
            title: assignmentTitle.value,
            course: assignmentCourse.value,
            courseName: assignmentCourse.options[assignmentCourse.selectedIndex].text,
            description: assignmentDescription.value,
            dueDate: assignmentDueDate.value,
            maxPoints: parseInt(assignmentMaxPoints.value) || 100,
            studentIds: selectedStudents
        };
        
        // Submit to API
        const response = await fetch('/api/assignments/create', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to create assignment');
        }
        
        showNotification('Assignment created successfully!', 'success');
        closeAssignmentModal();
        
        // Reload assignments list
        if (currentCourse) {
            loadAssignments(currentCourse);
        }
    } catch (error) {
        console.error('Error creating assignment:', error);
        showNotification(error.message || 'Failed to create assignment. Please try again.', 'error');
    }
}

// Open grade submission modal
function openGradeModal(assignmentId) {
    // Set assignment ID in hidden field
    gradeAssignmentId.value = assignmentId;
    
    // Show modal
    gradeModal.classList.remove('hidden');
}

// Close grade submission modal
function closeGradeModal() {
    gradeModal.classList.add('hidden');
    gradeForm.reset();
}

// Submit grade for assignment
async function submitGrade() {
    try {
        const assignmentId = gradeAssignmentId.value;
        const score = parseInt(gradeScore.value);
        const feedback = gradeFeedback.value;
        
        if (isNaN(score) || score < 0) {
            showNotification('Please enter a valid score', 'error');
            return;
        }
        
        // Submit to API
        const response = await fetch(`/api/assignments/grade/${assignmentId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify({ score, feedback })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to submit grade');
        }
        
        showNotification('Grade submitted successfully!', 'success');
        closeGradeModal();
        
        // Reload assignments list
        if (currentCourse) {
            loadAssignments(currentCourse);
        }
    } catch (error) {
        console.error('Error submitting grade:', error);
        showNotification(error.message || 'Failed to submit grade. Please try again.', 'error');
    }
}

// View assignment details
function viewAssignmentDetails(assignmentId) {
    // In a real implementation, this would show a modal with assignment details
    // For now, let's just log the ID and show an alert
    console.log('Viewing assignment:', assignmentId);
    alert('Assignment details would be shown here');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white z-50`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Expose necessary functions to window
window.openGradeModal = openGradeModal;
window.viewAssignmentDetails = viewAssignmentDetails; 