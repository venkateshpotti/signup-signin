document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Use `credentials: 'include'` to send the session cookie with the request
        const response = await fetch('http://localhost:3001/api/dashboard', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('welcome-message').textContent = `Welcome back, ${data.user.email}!`;
        } else {
            // If the server returns 401 Unauthorized, redirect to login
            window.location.href = 'index.html';
        }
    } catch (error) {
        // If there's a network error or the server is down, also redirect
        window.location.href = 'index.html';
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await fetch('http://localhost:3001/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'index.html';
    } catch (error) {
        alert('Failed to log out. Please try again.');
    }
});