// Teacher Attendance Management Script

// Global data
let currentClassStudents = [];
let token = localStorage.getItem('token');

// Elements (initialized when document is ready)
let classSelect, attendanceDate, attendanceTableContainer, noClassSelected;
let attendanceTableBody, markAllPresentBtn, saveAttendanceBtn;
let presentCount, absentCount, lateCount;

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
    classSelect = document.getElementById('classSelect');
    attendanceDate = document.getElementById('attendanceDate');
    attendanceTableContainer = document.getElementById('attendanceTableContainer');
    noClassSelected = document.getElementById('noClassSelected');
    attendanceTableBody = document.getElementById('attendanceTableBody');
    markAllPresentBtn = document.getElementById('markAllPresentBtn');
    saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    presentCount = document.getElementById('presentCount');
    absentCount = document.getElementById('absentCount');
    lateCount = document.getElementById('lateCount');
    
    // Set today's date as default
    const today = new Date();
    attendanceDate.value = today.toISOString().split('T')[0];

    // Event listener for class selection
    classSelect.addEventListener('change', function() {
        if (this.value) {
            loadStudentsForClass(this.value);
            attendanceTableContainer.classList.remove('hidden');
            if (noClassSelected) noClassSelected.classList.add('hidden');
        } else {
            attendanceTableContainer.classList.add('hidden');
            if (noClassSelected) noClassSelected.classList.remove('hidden');
        }
    });

    // Event listener for date change
    attendanceDate.addEventListener('change', function() {
        if (classSelect.value) {
            loadStudentsForClass(classSelect.value);
        }
    });

    // Mark all present button
    markAllPresentBtn.addEventListener('click', function() {
        const statusSelects = document.querySelectorAll('.attendance-status');
        statusSelects.forEach(select => {
            select.value = 'present';
        });
        updateCounters();
    });
    
    // Save attendance button
    saveAttendanceBtn.addEventListener('click', function() {
        if (!classSelect.value) {
            showNotification('Please select a class first.', 'error');
            return;
        }
        
        // Collect attendance data
        const attendanceData = [];
        const rows = attendanceTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const studentId = row.getAttribute('data-student-id');
            const status = row.querySelector('.attendance-status').value;
            const notes = row.querySelector('.attendance-notes').value || '';
            
            attendanceData.push({
                studentId,
                status,
                notes
            });
        });
        
        // Submit data to server
        submitAttendance(classSelect.value, attendanceDate.value, attendanceData);
    });

    // Redirect to class list
    const viewClassesBtn = document.getElementById('viewClassesBtn');
    if (viewClassesBtn) {
        viewClassesBtn.addEventListener('click', function() {
            window.location.href = 'teacher_class_management.html';
        });
    }

    // Load the teacher's courses
    loadTeacherCourses();
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
        while (classSelect.options.length > 1) {
            classSelect.remove(1);
        }
        
        // Add courses to dropdown
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.name;
            option.textContent = `${course.name} (${course.semester})`;
            classSelect.appendChild(option);
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
        const option = document.createElement('option');
        option.value = course.name;
        option.textContent = `${course.name} (${course.semester})`;
        classSelect.appendChild(option);
    });
}

// Load students for a specific class
async function loadStudentsForClass(classCode) {
    try {
        // Clear existing table
        attendanceTableBody.innerHTML = '';
        
        // Fetch students from API with date filter
        const date = attendanceDate.value;
        const url = `/api/attendance/class/${classCode}${date ? `?date=${date}` : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        currentClassStudents = students;
        
        // If we don't have real student data yet, use mock data
        if (students.length === 0) {
            return useMockStudents(classCode);
        }
        
        // Populate table with student data
        students.forEach(student => {
            // Find if student already has attendance for this date/class
            const existingAttendance = student.attendance.find(a => {
                const recordDate = new Date(a.date);
                const selectedDate = new Date(date);
                return recordDate.toDateString() === selectedDate.toDateString() 
                    && a.subject === classCode;
            });
            
            const row = document.createElement('tr');
            row.setAttribute('data-student-id', student.studentId);
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.studentId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            ${student.personalInfo.fullName.charAt(0)}
                        </div>
                        <span>${student.personalInfo.fullName}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="attendance-status rounded border p-1 w-full" onchange="updateCounters()">
                        <option value="present" ${existingAttendance && existingAttendance.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${existingAttendance && existingAttendance.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${existingAttendance && existingAttendance.status === 'late' ? 'selected' : ''}>Late</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="text" class="attendance-notes rounded border p-1 w-full" 
                        placeholder="Add notes..." 
                        value="${existingAttendance && existingAttendance.notes ? existingAttendance.notes : ''}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <a href="student_profile.html?id=${student.studentId}" class="text-purple-600 hover:text-purple-900">
                        <i class="fas fa-user mr-1"></i> View Profile
                    </a>
                </td>
            `;
            
            attendanceTableBody.appendChild(row);
        });
        
        updateCounters();
    } catch (error) {
        console.error('Error loading students:', error);
        useMockStudents(classCode);
    }
}

// Use mock student data if API fails
function useMockStudents(classCode) {
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
    
    if (mockStudents[classCode]) {
        mockStudents[classCode].forEach(student => {
            const row = document.createElement('tr');
            row.setAttribute('data-student-id', student.id);
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${student.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                            ${student.name.charAt(0)}
                        </div>
                        <span>${student.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <select class="attendance-status rounded border p-1 w-full" onchange="updateCounters()">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="text" class="attendance-notes rounded border p-1 w-full" placeholder="Add notes...">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <a href="student_profile.html?id=${student.id}" class="text-purple-600 hover:text-purple-900">
                        <i class="fas fa-user mr-1"></i> View Profile
                    </a>
                </td>
            `;
            
            attendanceTableBody.appendChild(row);
        });
    }
    
    updateCounters();
}

// Submit attendance data to the server
async function submitAttendance(classCode, date, attendanceData) {
    try {
        const response = await fetch('/api/attendance/submit', {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify({
                classCode,
                date,
                attendanceData
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save attendance');
        }
        
        showNotification('Attendance saved successfully!', 'success');
        
        // Reload the data to show updated attendance
        loadStudentsForClass(classCode);
    } catch (error) {
        console.error('Error saving attendance:', error);
        showNotification(error.message || 'Failed to save attendance. Please try again.', 'error');
    }
}

// Update attendance counters
function updateCounters() {
    const statusSelects = document.querySelectorAll('.attendance-status');
    let present = 0;
    let absent = 0;
    let late = 0;
    
    statusSelects.forEach(select => {
        if (select.value === 'present') present++;
        else if (select.value === 'absent') absent++;
        else if (select.value === 'late') late++;
    });
    
    if (presentCount) presentCount.textContent = present;
    if (absentCount) absentCount.textContent = absent;
    if (lateCount) lateCount.textContent = late;
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