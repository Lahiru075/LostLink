function togglePassword() {
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.querySelector('.show-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        showPasswordBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        showPasswordBtn.textContent = 'Show';
    }
}

// Placeholder function
function signInWithGoogle() {
    alert("Connecting to Google Sign-In service...");
}

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    if (email) {
        alert(`Login attempt for ${email}. Ready to connect to the backend!`);
    } else {
        alert("Please enter your email and password.");
    }
});