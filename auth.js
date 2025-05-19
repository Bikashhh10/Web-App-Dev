// Check authentication status and update UI
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName');

    if (token) {
        // Update UI for logged in user
        const authButtons = document.getElementById('authButtons');
        authButtons.innerHTML = `
            <li><a href="#" onclick="logout()">Welcome, ${userName}</a></li>
        `;

        // Hide/show menu items based on role
        const findJobsLink = document.querySelector('a[href="findjobs.html"]').parentElement;
        const hireLink = document.querySelector('a[href="hire.html"]').parentElement;

        if (role === 'employer') {
            findJobsLink.style.display = 'none';
            // Redirect if somehow on findjobs page
            if (window.location.href.includes('findjobs.html')) {
                window.location.href = 'hire.html';
            }
        } else {
            hireLink.style.display = 'none';
            // Redirect if somehow on hire page
            if (window.location.href.includes('hire.html')) {
                window.location.href = 'findjobs.html';
            }
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}

// Run auth check when page loads
document.addEventListener('DOMContentLoaded', checkAuth); 