// Admin Navigation Component
class AdminNav {
    static init() {
        const currentPath = window.location.pathname;
        const sidebarHtml = `
            <aside class="w-64 bg-purple-800 text-white p-6">
                <h2 class="text-2xl font-bold mb-8">Admin Dashboard</h2>
                <nav>
                    <a href="/admin_dashboard.html" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-700 ${currentPath.includes('admin_dashboard') ? 'bg-purple-900' : ''}">
                        <i class="fas fa-home mr-2"></i>Dashboard
                    </a>
                    <a href="/admin_students.html" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-700 ${currentPath.includes('admin_students') ? 'bg-purple-900' : ''}">
                        <i class="fas fa-user-graduate mr-2"></i>Students
                    </a>
                    <a href="/admin_teachers.html" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-700 ${currentPath.includes('admin_teachers') ? 'bg-purple-900' : ''}">
                        <i class="fas fa-chalkboard-teacher mr-2"></i>Teachers
                    </a>
                    <a href="/admin_courses.html" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-700 ${currentPath.includes('admin_courses') ? 'bg-purple-900' : ''}">
                        <i class="fas fa-book mr-2"></i>Courses
                    </a>
                    <a href="/admin_fees.html" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-purple-700 ${currentPath.includes('admin_fees') ? 'bg-purple-900' : ''}">
                        <i class="fas fa-money-bill-wave mr-2"></i>Fees
                    </a>
                </nav>
            </aside>
        `;

        // Insert the sidebar at the start of the main container
        const container = document.querySelector('.flex.h-screen');
        if (container) {
            container.insertAdjacentHTML('afterbegin', sidebarHtml);
            
            // Remove any existing sidebar
            const existingSidebar = container.querySelector('aside:not(:first-child)');
            if (existingSidebar) {
                existingSidebar.remove();
            }
        }
    }
} 