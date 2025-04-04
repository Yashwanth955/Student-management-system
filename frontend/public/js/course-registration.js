// Form data management
function saveFormData() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);
    localStorage.setItem('courseFormData', JSON.stringify(data));
}

function loadFormData() {
    const savedData = localStorage.getItem('courseFormData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById('registrationForm');
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = data[key];
        });
    }
}

function clearFormData() {
    localStorage.removeItem('courseFormData');
    document.getElementById('registrationForm').reset();
}

// Notification system
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Form validation
function validateForm() {
    const form = document.getElementById('registrationForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('border-red-500');
            if (!firstInvalidField) firstInvalidField = field;
        } else {
            field.classList.remove('border-red-500');
        }
    });

    if (!isValid && firstInvalidField) {
        firstInvalidField.focus();
        showNotification('Please fill in all required fields');
    }

    return isValid;
}

// Load instructors
async function loadInstructors() {
    try {
        const response = await fetch('/api/teachers');
        if (!response.ok) throw new Error('Failed to fetch instructors');
        
        const teachers = await response.json();
        const primaryInstructorSelect = document.querySelector('select[name="primaryInstructor"]');
        const coInstructorSelect = document.querySelector('select[name="coInstructor"]');
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher._id;
            option.textContent = teacher.personalInfo.fullName;
            
            primaryInstructorSelect.appendChild(option.cloneNode(true));
            coInstructorSelect.appendChild(option.cloneNode(true));
        });
    } catch (error) {
        console.error('Error loading instructors:', error);
        showNotification('Failed to load instructors');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    loadInstructors();

    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('change', saveFormData);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const formData = new FormData(form);
            const courseData = {
                courseName: formData.get('courseName'),
                courseCode: formData.get('courseCode'),
                department: formData.get('department'),
                credits: parseInt(formData.get('credits')),
                description: formData.get('description'),
                courseType: formData.get('courseType'),
                semester: formData.get('semester'),
                schedule: {
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    maxStudents: parseInt(formData.get('maxStudents'))
                },
                prerequisites: formData.get('prerequisites')
                    ? formData.get('prerequisites').split(',').map(code => code.trim())
                    : [],
                instructors: {
                    primary: formData.get('primaryInstructor'),
                    co: formData.get('coInstructor') || null
                }
            };

            const response = await fetch('/api/courses/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }

            const result = await response.json();
            showNotification('Course registered successfully!', 'success');
            clearFormData();
            setTimeout(() => {
                window.location.href = '/admin_courses.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            showNotification(error.message || 'Failed to register course');
        }
    });
}); 