document.getElementById('reset-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageArea = document.getElementById('message-area');

    if (newPassword !== confirmPassword) {
        messageArea.textContent = "Passwords do not match!";
        messageArea.className = 'message-area error-message';
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });
        const data = await response.json();
        messageArea.textContent = data.message;
        messageArea.className = 'message-area success-message';
        
        setTimeout(() => { window.location.href = 'index.html'; }, 3000);
    } catch (error) {
        messageArea.textContent = "An error occurred during password reset.";
        messageArea.className = 'message-area error-message';
    }
});