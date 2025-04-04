// Student Navigation Component
class StudentNav {
    static init() {
        const currentPath = window.location.pathname;
        const sidebarHtml = `
            <aside class="w-20 bg-purple-600 min-h-screen flex flex-col items-center py-8 space-y-8">
                <a href="/student_dashboard" class="sidebar-icon" title="Dashboard">
                    <span class="material-icons">school</span>
                </a>
                <a href="/student_profile" class="sidebar-icon" title="Profile">
                    <span class="material-icons">person</span>
                </a>
                <a href="/student_assignments" class="sidebar-icon" title="Assignments">
                    <span class="material-icons">assignment</span>
                </a>
                <a href="/student_documents" class="sidebar-icon" title="Documents">
                    <span class="material-icons">folder</span>
                </a>
                <a href="/student_reports" class="sidebar-icon" title="Reports">
                    <span class="material-icons">assessment</span>
                </a>
                <div class="sidebar-icon mt-auto relative" onclick="toggleNotifications()" title="Notifications">
                    <span class="material-icons">notifications</span>
                    <span class="notification-badge" id="notificationCount">3</span>
                </div>
                <div class="sidebar-icon" onclick="toggleSettings()" title="Settings">
                    <span class="material-icons">settings</span>
                </div>
            </aside>
        `;

        // Insert the sidebar at the start of the body
        document.body.insertAdjacentHTML('afterbegin', sidebarHtml);

        // Add active state to current page
        const sidebarLinks = document.querySelectorAll('.sidebar-icon');
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('bg-white/20');
            }
        });

        // Add required styles if not already present
        if (!document.querySelector('style[data-nav-styles]')) {
            const styles = `
                <style data-nav-styles>
                    .sidebar-icon {
                        @apply w-12 h-12 flex items-center justify-center text-white hover:bg-white/20 rounded-xl transition-all;
                    }
                    .notification-badge {
                        @apply absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
}

// Add global functions for notifications and settings
window.toggleNotifications = function() {
    // Notification functionality can be implemented later
    alert('Notifications panel coming soon!');
};

window.toggleSettings = function() {
    // Settings functionality can be implemented later
    alert('Settings panel coming soon!');
};

// Initialize navigation when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    StudentNav.init();
}); 