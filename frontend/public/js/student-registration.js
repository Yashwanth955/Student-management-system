// Save form data to localStorage
function saveFormData() {
    const form = document.getElementById('studentRegistrationForm');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    localStorage.setItem('studentRegistrationData', JSON.stringify(data));
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('studentRegistrationData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById('studentRegistrationForm');
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
    }
}

// Clear saved form data
function clearFormData() {
    localStorage.removeItem('studentRegistrationData');
}

document.getElementById('studentRegistrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const studentData = {
        personalInfo: {
            fullName: formData.get('fullName'),
            dateOfBirth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            bloodGroup: formData.get('bloodGroup')
        },
        contactInfo: {
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        academicInfo: {
            department: formData.get('department'),
            batch: formData.get('batch'),
            rollNumber: formData.get('rollNumber'),
            admissionDate: formData.get('admissionDate')
        },
        status: 'Active'
    };

    try {
        const response = await fetch('/api/students/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Clear saved form data on successful registration
        clearFormData();
        showNotification('Student registered successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'admin_students.html';
        }, 1500);
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message || 'Failed to register student. Please try again.', 'error');
        // Save form data when there's an error
        saveFormData();
    }
});

// Save form data when inputs change
document.querySelectorAll('#studentRegistrationForm input, #studentRegistrationForm select, #studentRegistrationForm textarea').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Load saved form data when the page loads
document.addEventListener('DOMContentLoaded', loadFormData);

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

// Validate form fields
function validateForm() {
    const form = document.getElementById('studentRegistrationForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('border-red-500');
            // Add error message below the field
            let errorMessage = input.nextElementSibling;
            if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                errorMessage = document.createElement('p');
                errorMessage.className = 'error-message text-red-500 text-sm mt-1';
                input.parentNode.insertBefore(errorMessage, input.nextSibling);
            }
            errorMessage.textContent = `${input.previousElementSibling.textContent.replace('*', '').trim()} is required`;
        } else {
            input.classList.remove('border-red-500');
            // Remove error message if it exists
            const errorMessage = input.nextElementSibling;
            if (errorMessage && errorMessage.classList.contains('error-message')) {
                errorMessage.remove();
            }
        }
    });

    return isValid;
}

// Add input event listeners for validation
document.querySelectorAll('#studentRegistrationForm input, #studentRegistrationForm select, #studentRegistrationForm textarea').forEach(input => {
    input.addEventListener('input', () => {
        if (input.hasAttribute('required')) {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                // Add error message
                let errorMessage = input.nextElementSibling;
                if (!errorMessage || !errorMessage.classList.contains('error-message')) {
                    errorMessage = document.createElement('p');
                    errorMessage.className = 'error-message text-red-500 text-sm mt-1';
                    input.parentNode.insertBefore(errorMessage, input.nextSibling);
                }
                errorMessage.textContent = `${input.previousElementSibling.textContent.replace('*', '').trim()} is required`;
            } else {
                input.classList.remove('border-red-500');
                // Remove error message
                const errorMessage = input.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    errorMessage.remove();
                }
            }
        }
    });
}); 