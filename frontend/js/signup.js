document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageArea = document.getElementById('message-area');

    try {
        const response = await fetch('http://localhost:3001/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            messageArea.textContent = 'Sign up successful! Redirecting to login...';
            messageArea.className = 'message-area success-message';
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        } else {
            messageArea.textContent = data.message;
            messageArea.className = 'message-area error-message';
        }
    } catch (error) {
        messageArea.textContent = 'An error occurred. Please try again.';
        messageArea.className = 'message-area error-message';
    }
});