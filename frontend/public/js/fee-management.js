// API endpoints
const API_ENDPOINTS = {
    FEES: '/api/fees',
    STUDENTS: '/api/students',
    STATS: '/api/fees/stats/overview'
};

// DOM Elements
const addFeeModal = document.getElementById('addFeeModal');
const addFeeForm = document.getElementById('addFeeForm');
const feeTable = document.getElementById('feeTable').getElementsByTagName('tbody')[0];
const searchInput = document.querySelector('input[name="search"]');
const feeTypeFilter = document.querySelector('select[name="feeType"]');
const statusFilter = document.querySelector('select[name="status"]');

// State
let currentPage = 1;
const itemsPerPage = 10;
let totalItems = 0;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadFeeStatistics(),
        loadFeeRecords(),
        loadStudents()
    ]);

    // Add event listeners
    searchInput.addEventListener('input', debounce(loadFeeRecords, 500));
    feeTypeFilter.addEventListener('change', loadFeeRecords);
    statusFilter.addEventListener('change', loadFeeRecords);
    addFeeForm.addEventListener('submit', handleAddFee);
});

// Load fee statistics
async function loadFeeStatistics() {
    try {
        const response = await fetch(API_ENDPOINTS.STATS);
        const data = await response.json();

        // Update statistics cards
        document.getElementById('totalFees').textContent = formatCurrency(data.totalFees);
        document.getElementById('collectedFees').textContent = formatCurrency(data.collectedFees);
        document.getElementById('pendingFees').textContent = formatCurrency(data.pendingFees);
        document.getElementById('overdueFees').textContent = formatCurrency(data.overdueFees);

        // Update percentages
        document.getElementById('collectedPercentage').textContent = `${data.collectedPercentage}%`;
        document.getElementById('pendingPercentage').textContent = `${data.pendingPercentage}%`;
        document.getElementById('overduePercentage').textContent = `${data.overduePercentage}%`;
    } catch (error) {
        showNotification('Error loading fee statistics', 'error');
    }
}

// Load fee records
async function loadFeeRecords() {
    try {
        const searchQuery = searchInput.value;
        const feeType = feeTypeFilter.value;
        const status = statusFilter.value;

        const response = await fetch(`${API_ENDPOINTS.FEES}?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&feeType=${feeType}&status=${status}`);
        const data = await response.json();

        totalItems = data.total;
        updatePagination();
        renderFeeRecords(data.fees);
        updateEntryInfo();
    } catch (error) {
        showNotification('Error loading fee records', 'error');
    }
}

// Render fee records
function renderFeeRecords(fees) {
    feeTable.innerHTML = '';
    fees.forEach(fee => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${fee.receiptNo || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${fee.student.personalInfo.fullName}</div>
                        <div class="text-sm text-gray-500">${fee.student.studentId}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${fee.feeType}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(fee.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(fee.dueDate)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${getStatusColor(fee.status)}">
                    ${fee.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewPaymentHistory('${fee._id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-history"></i>
                </button>
                <button onclick="generateReceipt('${fee._id}')" class="text-green-600 hover:text-green-900 mr-3">
                    <i class="fas fa-file-invoice"></i>
                </button>
                ${fee.status !== 'Paid' ? `
                    <button onclick="recordPayment('${fee._id}')" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                ` : ''}
            </td>
        `;
        feeTable.appendChild(row);
    });
}

// Load students for dropdown
async function loadStudents() {
    try {
        const response = await fetch(API_ENDPOINTS.STUDENTS);
        const students = await response.json();
        
        const studentSelect = document.querySelector('select[name="studentId"]');
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student._id;
            option.textContent = `${student.personalInfo.fullName} - ${student.studentId}`;
            studentSelect.appendChild(option);
        });
    } catch (error) {
        showNotification('Error loading students', 'error');
    }
}

// Handle add fee form submission
async function handleAddFee(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const feeData = {
        studentId: formData.get('studentId'),
        feeType: formData.get('feeType'),
        amount: parseFloat(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes')
    };

    try {
        const response = await fetch(API_ENDPOINTS.FEES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feeData)
        });

        if (!response.ok) {
            throw new Error('Failed to add fee');
        }

        showNotification('Fee added successfully', 'success');
        closeAddFeeModal();
        await Promise.all([loadFeeStatistics(), loadFeeRecords()]);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Modal functions
function openAddFeeModal() {
    addFeeModal.classList.remove('hidden');
}

function closeAddFeeModal() {
    addFeeModal.classList.add('hidden');
    addFeeForm.reset();
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getStatusColor(status) {
    const colors = {
        'Paid': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Overdue': 'bg-red-100 text-red-800',
        'Partially Paid': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white z-50`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadFeeRecords();
        }
    };
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-3 py-1 rounded-md ${currentPage === i ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            loadFeeRecords();
        };
        pagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadFeeRecords();
        }
    };
    pagination.appendChild(nextButton);
}

function updateEntryInfo() {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('startEntry').textContent = start;
    document.getElementById('endEntry').textContent = end;
    document.getElementById('totalEntries').textContent = totalItems;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 