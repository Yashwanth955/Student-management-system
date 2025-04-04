// Save form data to localStorage
function saveFormData() {
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
        if (key !== 'password' && key !== 'confirmPassword') {
            data[key] = value;
        }
    });
    localStorage.setItem('teacherRegistrationData', JSON.stringify(data));
}

// Load form data from localStorage
function loadFormData() {
    const savedData = localStorage.getItem('teacherRegistrationData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const form = document.getElementById('registrationForm');
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type !== 'file') {
                input.value = data[key];
            }
        });
    }
}

// Clear saved form data
function clearFormData() {
    localStorage.removeItem('teacherRegistrationData');
}

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
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input:not([type="file"]), select, textarea');
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

    // Password validation
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirmPassword"]');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        isValid = false;
        confirmPassword.classList.add('border-red-500');
        
        let errorMessage = confirmPassword.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'error-message text-red-500 text-sm mt-1';
            confirmPassword.parentNode.insertBefore(errorMessage, confirmPassword.nextSibling);
        }
        errorMessage.textContent = 'Passwords do not match';
    }

    return isValid;
}

document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const formData = new FormData(this);
    
    // Create the registration data
    const registrationData = {
        personalInfo: {
            fullName: formData.get('fullName'),
            dateOfBirth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            nationality: formData.get('nationality')
        },
        contactInfo: {
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        professionalInfo: {
            department: formData.get('department'),
            designation: formData.get('designation'),
            qualification: formData.get('qualification'),
            experience: parseInt(formData.get('experience')),
            specialization: formData.get('specialization'),
            researchInterests: formData.get('researchInterests')
        },
        password: formData.get('password')
    };

    try {
        const response = await fetch('/api/teachers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        clearFormData();
        showNotification('Registration successful! Your teacher ID is: ' + data.teacherId, 'success');
        setTimeout(() => {
            window.location.href = 'admin_teachers.html';
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
        saveFormData();
    }
});

// Save form data when inputs change
document.querySelectorAll('#registrationForm input:not([type="file"]), #registrationForm select, #registrationForm textarea').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Load saved form data when the page loads
document.addEventListener('DOMContentLoaded', loadFormData); 