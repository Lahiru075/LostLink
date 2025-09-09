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


});