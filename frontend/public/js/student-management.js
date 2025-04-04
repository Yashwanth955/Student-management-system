// API endpoints
const API_ENDPOINTS = {
    GET_STUDENTS: '/api/students',
    CREATE_STUDENT: '/api/students/register',
    UPDATE_STUDENT: '/api/students',
    DELETE_STUDENT: '/api/students'
};

// Load and display students
async function loadStudents(page = 1, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            ...filters
        });

        const response = await fetch(`${API_ENDPOINTS.GET_STUDENTS}?${queryParams}`);
        const data = await response.json();

        const tableBody = document.querySelector('#studentTable tbody');
        tableBody.innerHTML = '';

        data.forEach(student => {
            const row = createStudentTableRow(student);
            tableBody.appendChild(row);
        });

        updatePagination(page, Math.ceil(data.length / 10)); // Assuming 10 students per page
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification('Error loading students', 'error');
    }
}

// Create student table row
function createStudentTableRow(student) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="px-6 py-4">
            <div>
                <div class="font-medium text-gray-900">${student.personalInfo.studentId || ''}</div>
            </div>
        </td>
        <td class="px-6 py-4">
            <div>
                <div class="font-medium text-gray-900">${student.personalInfo.fullName || ''}</div>
                <div class="text-sm text-gray-500">${student.personalInfo.email || ''}</div>
            </div>
        </td>
        <td class="px-6 py-4">${student.academicInfo?.department || ''}</td>
        <td class="px-6 py-4">${student.academicInfo?.batch || ''}</td>
        <td class="px-6 py-4">
            <span class="px-2 py-1 text-sm rounded-full ${getStatusClass(student.status)}">${student.status || 'Active'}</span>
        </td>
        <td class="px-6 py-4">
            <button onclick="viewStudent('${student._id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="editStudent('${student._id}')" class="text-yellow-600 hover:text-yellow-800 mr-3">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteStudent('${student._id}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return row;
}

// View student details
async function viewStudent(studentId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.GET_STUDENTS}/${studentId}`);
        const student = await response.json();
        
        // Populate the view modal with student details
        document.getElementById('viewStudentName').textContent = student.personalInfo.fullName;
        document.getElementById('viewStudentId').textContent = student.personalInfo.studentId;
        document.getElementById('viewStudentEmail').textContent = student.personalInfo.email;
        document.getElementById('viewStudentDepartment').textContent = student.academicInfo.department;
        document.getElementById('viewStudentBatch').textContent = student.academicInfo.batch;
        
        openModal('viewStudentModal');
    } catch (error) {
        console.error('Error fetching student details:', error);
        showNotification('Error fetching student details', 'error');
    }
}

// Delete student
async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const response = await fetch(`${API_ENDPOINTS.DELETE_STUDENT}/${studentId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete student');
            }

            showNotification('Student deleted successfully', 'success');
            loadStudents(); // Reload the student list
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Error deleting student', 'error');
        }
    }
}

// Helper functions
function getStatusClass(status) {
    const statusClasses = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-red-100 text-red-800',
        'Suspended': 'bg-yellow-100 text-yellow-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
}

function updatePagination(currentPage, totalPages) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 border rounded hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => currentPage > 1 && loadStudents(currentPage - 1);
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-purple-600 text-white' : 'border hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => loadStudents(i);
        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 border rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextButton.textContent = 'Next';
    nextButton.onclick = () => currentPage < totalPages && loadStudents(currentPage + 1);
    pagination.appendChild(nextButton);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();

    // Initialize search and filters
    const searchInput = document.querySelector('input[name="search"]');
    const departmentSelect = document.querySelector('select[name="department"]');
    const statusSelect = document.querySelector('select[name="status"]');

    const handleFilters = () => {
        const filters = {
            search: searchInput.value,
            department: departmentSelect.value,
            status: statusSelect.value
        };
        loadStudents(1, filters);
    };

    searchInput?.addEventListener('input', handleFilters);
    departmentSelect?.addEventListener('change', handleFilters);
    statusSelect?.addEventListener('change', handleFilters);
}); 