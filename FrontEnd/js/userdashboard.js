$(document).ready(function () {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.html';
        return;
    }

    function fetchUnreadNotificationCount(){

        $.ajax({
            url: 'http://localhost:8080/notification/unread_count',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function(response){
                const count = response.count;
                const $badge = $('.notification-badge');
                if (count > 0) {
                    $badge.text(count).show();
                } else {
                    $badge.hide();
                }
            },
            error: function() {
                console.error("Could not fetch notification count.");
            }

        });

    }

    fetchUnreadNotificationCount();




    const $notificationContainer = $('#notification-bell-container');
    const $notificationDropdown = $('#notification-dropdown');
    const $notificationList = $('#notification-list'); // Central place for the URL

    // --- 2. Function to Fetch and Display the Notification List ---
    function fetchAndDisplayNotifications() {
        $notificationList.html('<li class="list-group-item text-center">Loading...</li>');
        $.ajax({
            url: `http://localhost:8080/notification/recent`,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            success: function(response) {
                $notificationList.empty();
                if (response.data && response.data.length > 0) {
                    $.each(response.data, function(i, noti) {
                        // const isUnreadClass = noti.read ? '' : 'unread';
                        // const notificationDate = new Date(noti.createdAt).toLocaleString();

                        // const notiHtml = `
                        //     <li class="list-group-item ${isUnreadClass}" 
                        //         data-noti-id="${noti.notificationId}" 
                        //         data-target-type="${noti.targetType}" 
                        //         data-target-id="${noti.targetId}">
                        //         ${noti.message}
                        //         <span class="notification-time">${notificationDate}</span>
                        //     </li>`;
                        // $notificationList.append(notiHtml);

                        const isUnreadClass = noti.isRead ? '' : 'unread';
                        const icon = noti.targetType === 'MATCH' ? 'fa-link' : 'fa--info-circle';
                        const notificationDate = new Date(noti.createdAt).toLocaleString();

                        // =================================================================
                        // === REPLACE THE OLD 'notiHtml' VARIABLE WITH THIS NEW ONE ===
                        // =================================================================
                        const notiHtml = `
                            <li class="list-group-item ${isUnreadClass}" 
                                data-noti-id="${noti.notificationId}" 
                                data-target-type="${noti.targetType}" 
                                data-target-id="${noti.targetId}"
                                data-is-for-loser="${noti.forLoser}"> 

                                <i class="fas ${icon} notification-icon"></i>
                                <div>
                                    <p class="notification-message">${noti.message}</p>
                                    <span class="notification-time">${notificationDate}</span>
                                </div>
                            </li>
                        `;
                        // =================================================================
                        
                        // The line below should remain as it is
                        $notificationList.append(notiHtml);

                    });
                } else {
                    $notificationList.html('<li class="list-group-item text-center">No notifications found.</li>');
                }
            },
            error: function() {
                $notificationList.html('<li class="list-group-item text-center text-danger">Could not load notifications.</li>');
            }
        });
    }

    // --- 3. Event Handlers ---

    // Toggle dropdown when the bell icon container is clicked
    $notificationContainer.on('click', function(event) {
        event.stopPropagation();
        // Toggle the 'show' class to display/hide the dropdown
        $notificationDropdown.toggleClass('show');

        // If the dropdown is now visible, fetch the latest notifications
        if ($notificationDropdown.hasClass('show')) {
            fetchAndDisplayNotifications();
        }
    });

    // Hide dropdown if the user clicks anywhere else on the page
    $(document).on('click', function(event) {
        // Check if the click was outside the notification container
        if (!$notificationContainer.is(event.target) && $notificationContainer.has(event.target).length === 0) {
            $notificationDropdown.removeClass('show');
        }
    });

    // Handle click on a single notification item in the list
    $notificationList.on('click', '.list-group-item', function() {
        const $item = $(this);
        const notificationId = $item.data('noti-id');
        const targetType = $item.data('target-type');
        const targetId = $item.data('target-id');
        const isForLoser = $item.data('is-for-loser');

        console.log(isForLoser);
        

        // If the item is unread, mark it as read via the API
        if ($item.hasClass('unread')) {
            $.ajax({
                url: `http://localhost:8080/notification/${notificationId}/mark-as-read`,
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + authToken },
                success: function() {
                    console.log(`Notification ${notificationId} marked as read.`);
                    // Visually mark as read without a full refresh
                    $item.removeClass('unread');
                    // Update the badge count after a slight delay
                    setTimeout(fetchUnreadNotificationCount, 500); 
                }
            });
        }

        // Redirect to the relevant page based on the target
        if (targetType === 'MATCH') {
           
            // 1. Determine which tab to open
            const tabToOpen = isForLoser ? 'lost' : 'found';

            // 2. Construct a URL with ONE simple parameter
            const redirectUrl = `matches.html?open_tab=${tabToOpen}`;

            // 3. Redirect the user
            window.location.href = redirectUrl;
           
        }
        // You can add more 'else if' blocks for other target types here
    });



    // --- Get Modal Elements (add these at the top with other modal variables) ---
    const $allNotificationsModal = $('#allNotificationsModal');
    const $closeAllNotificationsBtn = $('#closeAllNotificationsBtn');
    const $viewAllLink = $('.notification-footer a'); // Select the "View All" link
    const $fullNotificationList = $('#full-notification-list');

    // --- Functions to control the new modal ---
    function openAllNotificationsModal() {
        $allNotificationsModal.addClass('active');
    }
    function closeAllNotificationsModal() {
        $allNotificationsModal.removeClass('active');
    }

    $closeAllNotificationsBtn.on('click', closeAllNotificationsModal);

    // --- UPDATED Event Handler for "View All" Link ---
    $viewAllLink.on('click', function(event) {
        event.preventDefault(); // Prevent the link from trying to navigate
        
        // First, close the small dropdown
        $notificationDropdown.removeClass('show');
        
        // Then, open the big modal
        openAllNotificationsModal();
        
        // Now, fetch ALL notifications
        $fullNotificationList.html('<li class="list-group-item text-center">Loading...</li>');
        $.ajax({
            url: 'http://localhost:8080/notification/all', // The new endpoint
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            success: function(response) {
                $fullNotificationList.empty();
                if (response.data && response.data.length > 0) {
                    // We can reuse the same logic as the dropdown to build the list
                    $.each(response.data, function(i, noti) {
                        const isUnreadClass = noti.read ? '' : 'unread';
                        const icon = noti.targetType === 'MATCH' ? 'fa-link' : 'fa-info-circle';
                        const notificationDate = new Date(noti.createdAt).toLocaleString();
                        const notiHtml = `
                        <li class="list-group-item ${isUnreadClass}" 
                                data-noti-id="${noti.notificationId}" 
                                data-target-type="${noti.targetType}" 
                                data-target-id="${noti.targetId}"
                                data-is-for-loser="${noti.forLoser}"> 

                                <i class="fas ${icon} notification-icon"></i>
                                <div>
                                    <p class="notification-message">${noti.message}</p>
                                    <span class="notification-time">${notificationDate}</span>
                                </div>
                            </li>`; // (Same notiHtml as your dropdown)
                        $fullNotificationList.append(notiHtml);
                    });
                } else {
                    $fullNotificationList.html('<li class="list-group-item text-center">No notifications found.</li>');
                }
            }
        });
    });

    // Add click handler for items inside the big modal as well
    $fullNotificationList.on('click', '.list-group-item', function() {
        const $item = $(this);
        const notificationId = $item.data('noti-id');
        const targetType = $item.data('target-type');
        const targetId = $item.data('target-id');
        const isForLoser = $item.data('is-for-loser');

        console.log(isForLoser);
        

        // If the item is unread, mark it as read via the API
        if ($item.hasClass('unread')) {
            $.ajax({
                url: `http://localhost:8080/notification/${notificationId}/mark-as-read`,
                method: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + authToken },
                success: function() {
                    console.log(`Notification ${notificationId} marked as read.`);
                    // Visually mark as read without a full refresh
                    $item.removeClass('unread');
                    // Update the badge count after a slight delay
                    setTimeout(fetchUnreadNotificationCount, 500); 
                }
            });
        }

        // Redirect to the relevant page based on the target
        if (targetType === 'MATCH') {
           
            // 1. Determine which tab to open
            const tabToOpen = isForLoser ? 'lost' : 'found';

            // 2. Construct a URL with ONE simple parameter
            const redirectUrl = `matches.html?open_tab=${tabToOpen}`;

            // 3. Redirect the user
            window.location.href = redirectUrl;
           
        }
    });






    // =======================================================
    // ===       IMPROVED PROFILE MODAL SCRIPTING          ===
    // =======================================================

    // --- 1. Selectors ---
    const $profileModal = $('#profileModal');
    const $profileLink = $('#profileLink'); // Sidebar link
    const $closeProfileBtn = $('#closeProfileModalBtn');
    const $cancelBtn = $('#cancelBtn'); // Footer cancel button
    const $saveBtn = $('#saveBtn'); // Footer save button
    const $profileImageInput = $('#profileImageInput');
    const $profileImagePreview = $('#profileImagePreview');
    const $securityToggle = $('#securityToggle');
    const $passwordFields = $('#passwordFields');
    const $profileForm = $('#profileForm');

    // --- 2. Modal Control Functions ---
    function openProfileModal() {
        // You can load current user data here via an AJAX call if needed
        $profileModal.addClass('active');
    }


    function closeProfileModal() {
        clearProfileForm();
        $profileModal.removeClass('active');
    }

    // --- 3. Event Listeners ---

    // Open Modal
    $profileLink.on('click', function(e) {
        e.preventDefault();
        getProfileData();
        openProfileModal();
    });

    // Close Modal
    $closeProfileBtn.on('click', closeProfileModal);
    $cancelBtn.on('click', closeProfileModal);
    $profileModal.on('click', function(event) {
        if ($(event.target).is($profileModal)) {
            closeProfileModal();
        }
    });

    // --- 4. Profile Picture Preview Logic ---
    $profileImageInput.on('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $profileImagePreview.attr('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    // --- 5. Security & Password Toggle Logic ---
    $securityToggle.on('click', function() {
        $(this).toggleClass('open');
        $passwordFields.slideToggle();
    });

    // --- 6. Form Submission Logic (AJAX) ---
    $saveBtn.on('click', function() {
        // const formData = new FormData($profileForm[0]);

        // // Optional: Log data before sending
        // console.log("Profile data to be sent to backend:");
        // for (let [key, value] of formData.entries()) {
        //     // Don't log password fields for security
        //     if (!key.toLowerCase().includes('password')) {
        //         console.log(key, ':', value);
        //     }
        // }

        const formData = new FormData();

        formData.append('fullName', $('#fullName').val());
        formData.append('username', $('#username').val());
        formData.append('email', $('#email').val());
        formData.append('phoneNumber', $('#phoneNumber').val());

        const imageFile = $('#profileImageInput')[0].files[0];
        if (imageFile) {
            // User අලුතෙන් image එකක් තෝරා ඇත්නම් පමණක් එය append කරන්න
            formData.append('profileImage', imageFile);
            console.log("New profile image appended.");
        }

        // --- 4. Password Fields (වෙනස් කර ඇත්නම් පමණක්) එකතු කිරීම ---
        const confirmPassword = $('#confirmPassword').val();
        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();

        if (newPassword && newPassword.trim() !== '') {
            console.log("Password change detected. Appending all password fields.");
            formData.append('currentPassword', currentPassword);
            formData.append('newPassword', newPassword);
            formData.append('confirmPassword', confirmPassword);
        } else {
            console.log("No password change detected. Skipping password fields.");
        }

        // AJAX call to the backend
        $.ajax({
            url: 'http://localhost:8080/user_profile/update_profile', // <<--- ඔබේ backend endpoint එක මෙතනට දාන්න
            method: 'PATCH', // Use PUT for updates
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            data: formData,
            processData: false,
            contentType: false,

            success: function(response) {
                // console.log('Profile updated successfully:', response);

                alert('Profile updated successfully!');
                
                // getProfileData();
                closeProfileModal();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error updating profile:', jqXHR.responseText);
                
                try {
                     const errorResponse = JSON.parse(jqXHR.responseText);
                     alert('Error: ' + (errorResponse.message || 'Could not update profile.'));
                } catch(e) {
                     alert('An unknown error occurred. Please try again.');
                }
            }
        });
    });


    function getProfileData() {
        console.log("Opening profile modal and fetching user data...");

        $.ajax({
            url: 'http://localhost:8080/user_profile/get_profile_details', // The GET endpoint we just created
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function(response) {
                    
                    // --- Populate the form fields ---
                    const userData = response.data;
                    $('#fullName').val(userData.fullName);
                    $('#username').val(userData.username);
                    $('#email').val(userData.email);
                    $('#phoneNumber').val(userData.phoneNumber);

                    // --- Populate the profile header info ---
                    $('#profileNameDisplay').text(userData.fullName);
                    $('#profileUsernameDisplay').text('@' + userData.username);

                    // --- Update the profile picture ---
                    // Use a default image if the user doesn't have one
                    // const profilePicUrl = userData.profilePictureUrl || 'path/to/default-avatar.png';
                    $('#profileImagePreview').attr('src', userData.profileImageUrl);

                    // --- Now, show the modal ---
                    $profileModal.addClass('active');

            },
            error: function(jqXHR) {
                console.error("Failed to fetch profile data:", jqXHR.responseText);
                alert("Could not load your profile. Please try logging in again.");
            },
            complete: function() {
                // Hide the loading indicator
                // e.g., $('#loadingSpinner').hide();
            }
        });
    }



    function clearProfileForm() {
        $('#fullName').val('');
        $('#username').val('');
        $('#email').val('');
        $('#phoneNumber').val('');
        $('#currentPassword').val('');
        $('#newPassword').val('');
        $('#confirmPassword').val('');
        $('#profileImagePreview').attr('src', '');
        
    }

    // ==================================================
    // === JS ADDITION (Show/Hide Password Logic) ===
    // ==================================================

    // This code will work for all three password fields
    $('.toggle-password').on('click', function() {
        // Find the input field within the same input-group
        const inputField = $(this).closest('.input-group').find('input');
        
        // Check the current type of the input field
        const currentType = inputField.attr('type');
        
        // Toggle the type and the icon
        if (currentType === 'password') {
            inputField.attr('type', 'text');
            $(this).removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            inputField.attr('type', 'password');
            $(this).removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });





});