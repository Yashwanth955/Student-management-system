// API endpoints
const API_ENDPOINTS = {
    GET_TEACHERS: '/api/teachers',
    CREATE_TEACHER: '/api/teachers/register',
    UPDATE_TEACHER: '/api/teachers',
    DELETE_TEACHER: '/api/teachers'
};

// Load and display teachers
async function loadTeachers(page = 1, filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page,
            ...filters
        });

        const response = await fetch(`${API_ENDPOINTS.GET_TEACHERS}?${queryParams}`);
        const data = await response.json();

        const tableBody = document.querySelector('#teacherTable tbody');
        tableBody.innerHTML = '';

        data.forEach(teacher => {
            const row = createTeacherTableRow(teacher);
            tableBody.appendChild(row);
        });

        updatePagination(page, Math.ceil(data.length / 10)); // Assuming 10 teachers per page
    } catch (error) {
        console.error('Error loading teachers:', error);
        showNotification('Error loading teachers', 'error');
    }
}

// Create teacher table row
function createTeacherTableRow(teacher) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="px-6 py-4">
            <div>
                <div class="font-medium text-gray-900">${teacher.personalInfo.teacherId || ''}</div>
            </div>
        </td>
        <td class="px-6 py-4">
            <div>
                <div class="font-medium text-gray-900">${teacher.personalInfo.fullName || ''}</div>
                <div class="text-sm text-gray-500">${teacher.personalInfo.email || ''}</div>
            </div>
        </td>
        <td class="px-6 py-4">${teacher.department || ''}</td>
        <td class="px-6 py-4">${teacher.designation || ''}</td>
        <td class="px-6 py-4">
            <span class="px-2 py-1 text-sm rounded-full ${getStatusClass(teacher.status)}">${teacher.status || 'Active'}</span>
        </td>
        <td class="px-6 py-4">
            <button onclick="viewTeacher('${teacher._id}')" class="text-blue-600 hover:text-blue-800 mr-3">
                <i class="fas fa-eye"></i>
            </button>
            <button onclick="editTeacher('${teacher._id}')" class="text-yellow-600 hover:text-yellow-800 mr-3">
                <i class="fas fa-edit"></i>
            </button>
            <button onclick="deleteTeacher('${teacher._id}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    return row;
}

// View teacher details
async function viewTeacher(teacherId) {
    try {
        const response = await fetch(`${API_ENDPOINTS.GET_TEACHERS}/${teacherId}`);
        const teacher = await response.json();
        
        // Populate the view modal with teacher details
        document.getElementById('viewTeacherName').textContent = teacher.personalInfo.fullName;
        document.getElementById('viewTeacherId').textContent = teacher.personalInfo.teacherId;
        document.getElementById('viewTeacherEmail').textContent = teacher.personalInfo.email;
        document.getElementById('viewTeacherDepartment').textContent = teacher.department;
        document.getElementById('viewTeacherDesignation').textContent = teacher.designation;
        
        openModal('viewTeacherModal');
    } catch (error) {
        console.error('Error fetching teacher details:', error);
        showNotification('Error fetching teacher details', 'error');
    }
}

// Delete teacher
async function deleteTeacher(teacherId) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        try {
            const response = await fetch(`${API_ENDPOINTS.DELETE_TEACHER}/${teacherId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete teacher');
            }

            showNotification('Teacher deleted successfully', 'success');
            loadTeachers(); // Reload the teacher list
        } catch (error) {
            console.error('Error deleting teacher:', error);
            showNotification('Error deleting teacher', 'error');
        }
    }
}

// Helper functions
function getStatusClass(status) {
    const statusClasses = {
        'Active': 'bg-green-100 text-green-800',
        'Inactive': 'bg-red-100 text-red-800',
        'On Leave': 'bg-yellow-100 text-yellow-800'
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
    prevButton.onclick = () => currentPage > 1 && loadTeachers(currentPage - 1);
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded ${i === currentPage ? 'bg-purple-600 text-white' : 'border hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => loadTeachers(i);
        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 border rounded hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextButton.textContent = 'Next';
    nextButton.onclick = () => currentPage < totalPages && loadTeachers(currentPage + 1);
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
    loadTeachers();

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
        loadTeachers(1, filters);
    };

    searchInput?.addEventListener('input', handleFilters);
    departmentSelect?.addEventListener('change', handleFilters);
    statusSelect?.addEventListener('change', handleFilters);
}); 