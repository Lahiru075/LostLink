$(document).ready(function() {


    // ===============================================
    // ===        ADMIN PROFILE MODAL SCRIPT         ===
    // ===============================================

    // --- Selectors ---
    const $profileModal = $('#profileModal');
    const $profileLink = $('#Admin_Profile'); // Sidebar link ID
    const $closeProfileBtn = $('#closeProfileModalBtn');
    const $cancelBtn = $('#cancelBtn');
    const $saveBtn = $('#saveBtn');
    const $profileImageInput = $('#profileImageInput');
    const $profileImagePreview = $('#profileImagePreview');
    const $securityToggle = $('#securityToggle');
    const $passwordFields = $('#passwordFields');
    const $profileForm = $('#profileForm');

    // --- Main Function to Fetch Data and Open Modal ---
    function openProfileModal() {
        console.log("Fetching profile data...");

        $.ajax({
            url: 'http://localhost:8080/user_profile/get_profile_details',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {
                    const userData = response.data;
                    
                    // Populate form fields
                    $('#fullName').val(userData.fullName);
                    $('#username').val(userData.username);
                    $('#email').val(userData.email);
                    $('#phoneNumber').val(userData.phoneNumber);

                    // Populate profile header
                    $('#profileNameDisplay').text(userData.fullName);
                    $('#profileUsernameDisplay').text('@' + userData.username);
                    $('#profileImagePreview').attr('src', userData.profileImageUrl || 'default-avatar.png');

                    // Now, show the modal
                    $profileModal.addClass('active');

            },
            error: function(jqXHR) {
                console.error("Failed to fetch profile data:", jqXHR.responseText);
                alert("Could not load your profile. Please try logging in again.");
            }
        });
    }

    // --- Function to Close and Reset Modal ---
    function closeProfileModal() {
        $profileForm[0].reset(); // Clear form fields
        $passwordFields.hide(); // Hide password section
        $securityToggle.removeClass('open'); // Reset toggle state
        $profileModal.removeClass('active');
    }

    // --- Event Listeners ---
    $profileLink.on('click', function(e) {
        e.preventDefault();
        openProfileModal(); // Single function call to open and load
    });

    $closeProfileBtn.on('click', closeProfileModal);
    $cancelBtn.on('click', closeProfileModal);

    // Profile Picture Preview
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

    // Security & Password Toggle
    $securityToggle.on('click', function() {
        $(this).toggleClass('open');
        $passwordFields.slideToggle();
    });
    
    // Show/Hide Password Icon Toggle
    $('.toggle-password').on('click', function() {
        const inputField = $(this).prev('input');
        const currentType = inputField.attr('type');
        if (currentType === 'password') {
            inputField.attr('type', 'text');
            $(this).removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            inputField.attr('type', 'password');
            $(this).removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Form Submission (Save Changes)
    $saveBtn.on('click', function() {
        const formData = new FormData();
        formData.append('fullName', $('#fullName').val());
        formData.append('username', $('#username').val());
        formData.append('email', $('#email').val());
        formData.append('phoneNumber', $('#phoneNumber').val());

        const imageFile = $profileImageInput[0].files[0];
        if (imageFile) {
            formData.append('profileImage', imageFile);
        }

        const newPassword = $('#newPassword').val();
        if (newPassword && newPassword.trim() !== '') {
            formData.append('currentPassword', $('#currentPassword').val());
            formData.append('newPassword', newPassword);
            formData.append('confirmPassword', $('#confirmPassword').val());
        }

        $.ajax({
            url: 'http://localhost:8080/user_profile/update_profile',
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                alert('Profile updated successfully!');
                closeProfileModal();
                // You might want to update the avatar in the main header as well
                // loadAvatarAndName(); 
            },
            error: function(jqXHR) {
                console.error('Error updating profile:', jqXHR.responseText);
                try {
                    const errorResponse = JSON.parse(jqXHR.responseText);
                    alert('Error: ' + (errorResponse.message || 'Could not update profile.'));
                } catch(e) {
                    alert('An unknown error occurred.');
                }
            }
        });
    });

    
    function loadAveratarAndName() {
        $.ajax({
            url: 'http://localhost:8080/user_profile/get_profile_details', // The GET endpoint we just created
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function(response) {
                $('.profile-avatar').attr('src', response.data.profileImageUrl);
                $('.profile-name').text(response.data.fullName);
            }

        })
    }

    loadAveratarAndName();

    // =======================================================
    // ===       LOAD TOTAL USER COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalUserCount() {
        $.ajax({
            url: 'http://localhost:8080/user_manage/total_user_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                $('#total-users').text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                $('#totalUsersCount').text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalUserCount();

    function loadTotalLostItemCount() {
        $.ajax({
            url: 'http://localhost:8080/lost_item_manage/total_item_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                $('#total-lost').text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                totalItemsCountEl.text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalLostItemCount();

    // =======================================================
    // ===       LOAD TOTAL Item COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalFoundItemCount() {
        $.ajax({
            url: 'http://localhost:8080/found_item_manage/total_item_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                $('#total-found').text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                totalItemsCountEl.text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalFoundItemCount();


    function loadTotalRecoveredItemCount() {
        $.ajax({
            url: 'http://localhost:8080/match_item_manage/total_recovered_item_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                $('#total-recoveries').text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                totalItemsCountEl.text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalRecoveredItemCount();


    // ===============================================
    // ===    LOAD REPORTS REQUIRING ATTENTION     ===
    // ===============================================
    function loadAttentionReports() {
        const container = $('#attentionReportsContainer');
        container.html('<p>Loading reports...</p>'); // Show loading state

        $.ajax({
            url: 'http://localhost:8080/admin_dashboard/attention_reports',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {
                container.empty();   
    
                response.data.forEach(report => {
                    
                    // හැමවිටම එකම tag එක
                    const tagClass = 'tag-stale';
                    const tagText = 'Pending Action';

                    const reportHtml = `
                        <div class="attention-item">
                            <div class="attention-details">
                                <p class="attention-message">${report.message}</p>
                                <span class="attention-user-info">${report.userInfo}</span>
                            </div>
                            <span class="attention-tag ${tagClass}">${tagText}</span>
                        </div>
                    `;
                    container.append(reportHtml);
                });
            },
            error: function(err) {
                console.error("Failed to load attention reports:", err);
                container.html('<p class="no-data">Could not load reports.</p>');
            }
        });
    }

    // --- INITIAL LOAD ---
    loadAttentionReports();



    // ===============================================
    // ===          LOAD RECENT ACTIVITY           ===
    // ===============================================
    function loadRecentActivity() {
        const listContainer = $('#recentActivityList');
        listContainer.html('<li><div class="item-info"><small>Loading activity...</small></div></li>');

        $.ajax({
            url: 'http://localhost:8080/admin_dashboard/recent_activities',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {
                listContainer.empty(); // Clear "Loading..." message
                    
                response.data.forEach(activity => {
                    // "x hours ago" වගේ format එකට time එක හදනවා
                    const timeAgo = formatTimeAgo(activity.timestamp); 

                    const activityHtml = `
                        <li>
                            <div class="item-info">
                                <strong>${activity.message}</strong>
                                <small>${timeAgo}</small>
                            </div>
                        </li>
                    `;
                    listContainer.append(activityHtml);
                });

            },
            error: function(err) {
                console.error("Failed to load recent activity:", err);
                listContainer.html('<li><div class="item-info"><small>Could not load activity.</small></div></li>');
            }
        });
    }

    // Helper function to create "2 hours ago" type strings
    // For a real app, use a library like Moment.js or date-fns for accuracy
    function formatTimeAgo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    // --- INITIAL LOAD ---
    // Page එක load වෙනකොට, මේ function එක call කරනවා
    loadRecentActivity();


    // ===============================================
    // ===    LOAD RECENT SUCCESSFUL RECOVERIES    ===
    // ===============================================
    function loadRecentRecoveries() {
        const tableBody = $('#recentRecoveriesTableBody'); // <tbody> එක select කරගන්නවා
        tableBody.html('<tr><td colspan="5" class="text-center">Loading...</td></tr>'); // Loading message එකක් පෙන්වනවා

        $.ajax({
            url: 'http://localhost:8080/admin_dashboard/recent_recoveries', // <<< Backend Endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            
            success: function(response) {
                tableBody.empty(); // Loading message එක clear කරනවා
                    
                // Backend එකෙන් එන හැම recovery record එකකටම, table row එකක් හදනවා
                response.data.forEach(recovery => {

                    console.log(recovery);
                    
                    
                    // Date එක YYYY-MM-DD format එකට සකස් කරනවා
                    const dateRecovered = new Date(recovery.matchDate).toLocaleDateString('en-CA');

                    const rowHtml = `
                        <tr>
                            <td>'${recovery.lostItemTitle}'</td>
                            <td>${recovery.loserFullName}</td>
                            <td>${recovery.finderFullName}</td>
                            <td>${dateRecovered}</td>
                            <td><span class="status-badge status-recovered">${recovery.matchStatus}</span></td>
                        </tr>
                    `;
                    tableBody.append(rowHtml); // හදපු row එක table එකට එකතු කරනවා
                });

               
            },
            error: function(err) {
                console.error("Failed to load recent recoveries:", err);
                tableBody.html('<tr><td colspan="5" class="text-center">Could not load data. Please try again.</td></tr>');
            }
        });
    }


    // --- INITIAL LOAD ---
    // Page එක load වෙනකොට, මේ function එක call කරනවා
    loadRecentRecoveries();




    $('#logoutBtn').on('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('authToken');
        alert("You have been logged out successfully.");
        window.location.href = 'loginpage.html'; 
    });

});