// Navigation component
const createNav = (activePage) => `
    <aside class="w-20 bg-purple-600 min-h-screen flex flex-col items-center py-8 space-y-8">
        <a href="/student_dashboard.html" class="sidebar-icon ${activePage === 'dashboard' ? 'bg-white/20' : ''}">
            <span class="material-icons">dashboard</span>
        </a>
        <a href="/student_profile.html" class="sidebar-icon ${activePage === 'profile' ? 'bg-white/20' : ''}">
            <span class="material-icons">person</span>
        </a>
        <a href="/student_reports.html" class="sidebar-icon ${activePage === 'reports' ? 'bg-white/20' : ''}">
            <span class="material-icons">assessment</span>
        </a>
        <a href="/student_documents.html" class="sidebar-icon ${activePage === 'documents' ? 'bg-white/20' : ''}">
            <span class="material-icons">folder</span>
        </a>
        <a href="/student_assignments.html" class="sidebar-icon ${activePage === 'assignments' ? 'bg-white/20' : ''}">
            <span class="material-icons">assignment</span>
        </a>
        <div class="sidebar-icon mt-auto">
            <span class="material-icons" onclick="logout()">logout</span>
        </div>
    </aside>
`;

// Profile section component
const createProfileSection = () => `
    <aside class="w-80 bg-white p-6 border-l">
        <div class="flex flex-col items-center mb-6">
            <img id="userAvatar" src="https://ui-avatars.com/api/?name=Student&background=6D28D9&color=fff" class="w-20 h-20 rounded-full mb-2">
            <h3 id="userName" class="font-bold text-lg">Student Name</h3>
            <p id="userLocation" class="text-gray-500">Location</p>
        </div>

        <div class="flex justify-around mb-6">
            <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">24</div>
                <div class="text-sm text-gray-500">Courses</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">18</div>
                <div class="text-sm text-gray-500">Certification</div>
            </div>
        </div>

        <div class="space-y-4">
            <div class="bg-orange-100 p-4 rounded-xl">
                <h4 class="font-bold mb-2">Consultation</h4>
                <p class="text-sm text-gray-600">Get a mentor to help your learning process</p>
            </div>
            <div class="bg-pink-100 p-4 rounded-xl">
                <h4 class="font-bold mb-2">Set target</h4>
                <p class="text-sm text-gray-600">Set target milestones and your study timeline</p>
            </div>
        </div>
    </aside>
`;

// Common functions
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
}

function updateUserInfo() {
    const userEmail = localStorage.getItem('userEmail');
    const userName = userEmail ? userEmail.split('@')[0] : 'Student';
    
    if (document.getElementById('studentName')) {
        document.getElementById('studentName').textContent = userName;
    }
    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = userName;
    }
    if (document.getElementById('userLocation')) {
        document.getElementById('userLocation').textContent = 'Student';
    }
    if (document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${userName}&background=6D28D9&color=fff`;
    }
}

// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'student') {
        window.location.href = '/';
        return false;
    }
    return true;
} 