$(document).ready(function () {
    window.togglePassword = function (fieldId) {
        const passwordField = $('#' + fieldId);
        const showPasswordBtn = passwordField.next('.show-password');

        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            showPasswordBtn.text('Hide');
        } else {
            passwordField.attr('type', 'password');
            showPasswordBtn.text('Show');
        }
    }
    
    window.signInWithGoogle = function () {
        alert("Connecting to Google Sign-Up service...");
    }

    const $signupForm = $('#signupForm');
    // const $submitButton = $signupForm.find('button.login-btn');

    const $submitButton = $('.login-btn');

    // We listen to the button click event
    $submitButton.on('click', function (event) {
        
        // --- A. Get all values from the form ---
        const fullName = $('#fullName').val().trim();
        const email = $('#email').val().trim();
        const phoneNumber = $('#phoneNumber').val().trim();
        const username = $('#username').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        const role = "USER";
        const status = "ACTIVE";

        // --- B. Frontend Validation ---
        if (!fullName || !email || !phoneNumber || !username || !password || !confirmPassword) {


            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error: Please fill in all required fields..!",
            });

            return;
        }
        if (password !== confirmPassword) {

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error: Passwords do not match. Please try again..!",
            });

            return;
        }
        if (password.length < 8) {

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error: Password must be at least 8 characters long..!",
            });

            return;
        }

        // --- C. Prepare data object to send as JSON ---
        const userData = {
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            username: username, 
            password: password,
            role: role,
            status: status
        };

        // --- D. User Feedback & AJAX Call ---
        // Disable button and show loading state
        $(this).prop('disabled', true).text('Creating Account...');
        
        $.ajax({

            url: 'http://localhost:8080/auth/register',
            method: 'POST',             
            contentType: 'application/json',
            data: JSON.stringify(userData), 

            success: function(response) {
                console.log('Registration successful:', response);

                Swal.fire({
                    title: "Success!",
                    icon: "success",
                    text: 'Account created successfully! You will now be redirected to the login page!',
                    draggable: true
                }).then(() => {
                    window.location.href = '../html/loginpage.html'; 
                });
                
                clearFormFields();

            },

            // This function runs if the request FAILS
            error: function(jqXHR) {
                console.error('Registration failed:', jqXHR.responseText);
                // Try to get a meaningful error message from the backend response
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "An unknown error occurred. Please try again.";
                // alert(`Registration Failed: ${errorMessage}`);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Registration Failed: ${errorMessage}..!`,
                });
            },

            // This function runs ALWAYS, after success or error
            complete: function() {
                // Re-enable the button and restore its text
                $submitButton.prop('disabled', false).text('Create Account');
            }
        });
    });

    function clearFormFields() {
        $('#fullName').val(''); 
        $('#email').val(''); 
        $('#phoneNumber').val(''); 
        $('#username').val(''); 
        $('#password').val(''); 
        $('#confirmPassword').val(''); 
    }

}); // End of document ready

