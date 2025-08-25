
// Ensure the DOM is fully loaded before running any script
$(document).ready(function () {

    window.togglePassword = function () {
        const $passwordInput = $('#password');
        const $showPasswordBtn = $('.show-password');

        if ($passwordInput.attr('type') === 'password') {
            $passwordInput.attr('type', 'text');
            $showPasswordBtn.text('Hide');
        } else {
            $passwordInput.attr('type', 'password');
            $showPasswordBtn.text('Show');
        }
    }
    
    // Placeholder for Google Sign-in
    window.signInWithGoogle = function () {
        alert("Connecting to Google Sign-In service...");
    }

    const $submitButton = $('.login-btn');

    $submitButton.on('click', function () {
        
        // --- A. Get values from the form ---
        const username = $('#username').val().trim();
        const password = $('#password').val();

        // --- B. Frontend Validation ---
        if (!username || !password) {
            alert("Error: Please enter both username and password.");
            return;
        }

        // --- C. Prepare data object to send as JSON ---
        const loginData = {
            username: username,
            password: password
        };

        // --- D. User Feedback & AJAX Call ---
        $(this).prop('disabled', true).text('Signing In...');
        
        $.ajax({

            url: 'http://localhost:8080/auth/login', 
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),

            success: function(response) {
                console.log('Login successful:', response);

                if(response && response.data.accessToken) {
                    localStorage.setItem('authToken', response.data.accessToken);

                    console.log('Token saved in localStorage:', localStorage.getItem('authToken'));

                    alert('Login successful! Redirecting to your dashboard...');
                
                    if (response.data.role === 'ADMIN') {
                        window.location.href = '../html/admindashboard.html'; 
                    }else {
                        window.location.href = '../html/userdashboard.html';
                    }

                } else {
                    alert('Login successful, but no token received from the server.');
                }
            },

            // This function runs if the request FAILS (e.g., wrong credentials)
            error: function(jqXHR) {
                console.error('Login failed:', jqXHR.responseText);
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Invalid username or password. Please try again.";
                alert(`Login Failed: ${errorMessage}`);
            },

            // This function runs ALWAYS, after success or error
            complete: function() {
                // Re-enable the button and restore its text
                $submitButton.prop('disabled', false).text('Sign In');
            }
        });
    });

}); 
