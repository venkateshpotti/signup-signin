document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageArea = document.getElementById('message-area');

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // `credentials: 'include'` is essential for sending the session cookie
            credentials: 'include', 
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            window.location.href = 'dashboard.html';
        } else {
            messageArea.textContent = data.message;
            messageArea.className = 'message-area error-message';
        }
    } catch (error) {
        messageArea.textContent = 'An error occurred. Please try again.';
        messageArea.className = 'message-area error-message';
    }
});