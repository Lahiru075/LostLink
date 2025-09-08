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



});