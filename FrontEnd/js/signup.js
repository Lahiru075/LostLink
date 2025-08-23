function togglePassword(fieldId) {
    const passwordField = document.getElementById(fieldId);
    // Find the button within the same password-container
    const showPasswordBtn = passwordField.nextElementSibling; 

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        showPasswordBtn.textContent = 'Hide';
    } else {
        passwordField.type = 'password';
        showPasswordBtn.textContent = 'Show';
    }
}

function signInWithGoogle() {
    alert("Connecting to Google Sign-Up service...");
}

// Handle the new sign-up form submission
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // --- Validation ---
    if (!fullName || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }
    
    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    // If all validation passes
    alert(`Welcome, ${fullName}! Account created successfully. Ready to connect to the backend!`);
});