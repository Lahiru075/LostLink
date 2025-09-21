
$(document).ready(function() {


    function validateAndLoadDashboard() {
        let token = localStorage.getItem('authToken');

        if (!token) {

            window.location.href = '../html/loginpage.html';
            return false; 

        }

        const tokenParts = token.split('.');

        if (tokenParts.length !== 3) {
            window.location.href = '../html/loginpage.html';
            return false; 
        }

        try {
            const tokenPayload = JSON.parse(atob(tokenParts[1]));

            const currentTimestamp = Math.floor(Date.now() / 1000);
            // console.log("Current timestamp:", currentTimestamp);
            // console.log("Token expiration timestamp:", tokenPayload.exp);

        if (tokenPayload.exp && currentTimestamp >= tokenPayload.exp) {
            alert('Session expired. Please login again.');
            localStorage.removeItem('authToken');
            window.location.href = '../html/loginpage.html';
            return false; 
        }


        } catch (error) {

            console.error('Invalid token:', error);
            window.location.href = '../html/loginpage.html';
            return false; 

        }

        return true;

    }

    if (validateAndLoadDashboard()) {

        setInterval(validateAndLoadDashboard, 10000);

    }



    // ===============================================
    // ===     DYNAMIC HEADER GREETING SCRIPT      ===
    // ===============================================

    function updateHeaderGreeting() {
        const now = new Date();
        const hour = now.getHours();

        // 1. Determine the greeting based on the time of day
        let greetingText;
        if (hour < 12) {
            greetingText = "Good Morning, Admin! ☀️";
        } else if (hour < 18) {
            greetingText = "Good Afternoon, Admin! 👋";
        } else {
            greetingText = "Good Evening, Admin! 🌙";
        }

        // 2. Format the date beautifully
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateText = now.toLocaleDateString('en-US', options);

        // 3. Update the HTML elements
        $('#greeting-title').text(greetingText);
        $('#greeting-date').text(dateText);
    }

    // Call the function when the page loads
    updateHeaderGreeting();



    // ===============================================
    // ===     GET ALL USERS AND SEARCH USERS      ===
    // ===============================================


    // --- Selectors ---
    const userSearchInput = $('#userSearch');
    const statusFilter = $('#status-filter');
    const suggestionsPanel = $('#suggestionsPanel');
    const userTableBody = $('#userTableBody');
    const paginationContainer = $('#paginationContainer'); // Pagination වල සම්පූර්ණ container එක

    // --- State Management ---
    let currentPage = 0;
    let currentSearch = '';
    let currentStatus = 'all';
    let totalPages = 0;
    let totalUsers = 0;
    const pageSize = 2; // එක පිටුවක users ලා ගණන

    // --- Debounce Function ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Main Function to Load Users ---
    function loadUsers(page = 0) {

        currentPage = page;

        const searchKeyword = userSearchInput.val().trim();
        const status = statusFilter.val();

        const filterData = {
            page: currentPage,
            size: pageSize
        };
        
        // Add filters to the object only if they have a value
        if (searchKeyword) {
            filterData.search = searchKeyword;
        }
        if (status && status !== 'all') {
            filterData.status = status;
        }
        

        $.ajax({
            url: 'http://localhost:8080/user_manage/all',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            success: function(response) {
        
                userTableBody.empty(); // Clear loading message          

                // --- Response එකෙන් data සහ pagination details ගන්නවා ---
                const paginatedData = response.data;
                const userList = paginatedData.content;
                const totalUsers = paginatedData.numberOfElements;
                totalPages = paginatedData.totalPages;

 
                    // ===============================================
                    // ===       TABLE ROW GENERATION LOGIC        ===
                    // ===============================================
                    userList.forEach(user => {

                        const statusClass = user.status ? user.status.toLowerCase() : 'unknown';
                        const roleClass = user.role ? user.role.toLowerCase() : 'unknown';
                        
                        const actionButtonHtml = (statusClass === 'active')
                            ? `<button class="action-btn action-suspend" data-user-id="${user.userId}" title="Suspend User">
                                <i class="fas fa-user-slash"></i> Suspend
                            </button>`
                            : `<button class="action-btn action-activate" data-user-id="${user.userId}" title="Activate User">
                                <i class="fas fa-user-check"></i> Activate
                            </button>`;
                        
                        const joinedDate = user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-CA') : 'N/A';

                        const userRowHtml = `
                            <tr>
                                <td>
                                    <div class="user-cell">
                                        <img src="${user.profileImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic" alt="User">
                                        <div class="user-cell-info">
                                            <span class="user-name">${user.fullName}</span>
                                            <span class="user-email">${user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="role-badge role-${roleClass}">${user.role}</span></td>
                                <td><span class="status-badge status-${statusClass}">${user.status}</span></td>
                                <td>${joinedDate}</td>
                                <td class="text-center">
                                    <div class="action-menu">
                                        ${actionButtonHtml}
                                    </div>
                                </td>
                            </tr>
                        `;
                        userTableBody.append(userRowHtml);
                    });
                
                renderPagination(totalUsers, userList.length);
            },
            error: function(err) {
                console.error("Failed to load users", err);
                userTableBody.html('<tr><td colspan="5" class="text-center">Failed to load data.</td></tr>');
                paginationContainer.hide(); // Error එකක් ආවොත් pagination එක hide කරනවා
            }
        });
    }

    function renderPagination(totalUsers, currentEntryCount) {
    
        // Console log for debugging
        console.log(`Rendering Pagination: totalUsers=${totalUsers}, totalPages=${totalPages}, currentPage=${currentPage}`);

        // If there's only one page or no users, hide the pagination
        if (!totalUsers || totalUsers <= 0 || totalPages <= 1) {
            paginationContainer.hide();
            console.log("Pagination hidden: Not enough users or pages.");
            return;
        }
        
        const startEntry = currentPage * pageSize + 1;
        const endEntry = startEntry + currentEntryCount - 1;
        
        // --- Update the HTML elements directly ---
        const paginationInfoEl = paginationContainer.find('#paginationInfo');
        const prevBtnEl = paginationContainer.find('#prevBtn');
        const nextBtnEl = paginationContainer.find('#nextBtn');

        // Update the info text
        paginationInfoEl.text(`Showing ${startEntry}-${endEntry} of ${totalUsers}`);
        
        // Enable/disable buttons based on the current page
        prevBtnEl.prop('disabled', currentPage === 0);
        nextBtnEl.prop('disabled', currentPage >= totalPages - 1);

        // Finally, make sure the container is visible
        paginationContainer.show();
        console.log("Pagination rendered and shown.");
    }

    // --- Get Search Suggestions Function ---

    function getSuggestions(query) {

        if (query.length < 2) {
            suggestionsPanel.empty().hide();
            return;

        }


        $.ajax({
            url: 'http://localhost:8080/user_manage/suggestions', // Base URL only
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            
            // jQuery will create the query string: "?query=..." from this object
            data: { 
                query: query 
            },
            

            success: function(suggestions) {

                suggestionsPanel.empty();
                if (suggestions && suggestions.data.length > 0) {               

                    suggestions.data.forEach(name => {
                        const item = $(`<div class="suggestion-item">${name}</div>`);
                        // Event handler for clicking a suggestion
                        item.on('click', function() {
                            userSearchInput.val(name); // Put the selected name into the search box
                            suggestionsPanel.hide();   // Hide the suggestions panel
                            loadUsers(0);              // Trigger a search with the selected name
                        });
                        suggestionsPanel.append(item);
                    });
                    suggestionsPanel.show();
                } else {
                    suggestionsPanel.hide();
                }
            },
            error: function(err) {
                console.error("Failed to fetch suggestions:", err);
                suggestionsPanel.hide(); // Hide panel on error as well
            }
        });
        // ... (this function remains the same, it uses a different endpoint) ...
    }

    // --- AJAX Call using the 'data' property ---
    

    // --- Event Listeners ---
    
    // Keyup/Keypress වෙනුවට 'input' event එක පාවිච්චි කරනවා - මේක තමයි හොඳම ක්‍රමය
    userSearchInput.on('input', debounce(function() {
        const query = $(this).val();
        currentSearch = query;

        if (query.length >= 2) {
            getSuggestions(query);
        } else {
            suggestionsPanel.hide();
        }
        
        // Search box එක හිස් කළාම, නැවත default data load කරනවා
        if (query === '') {
            loadUsers(0);
        }
    }, 400)); // 400ms delay

    statusFilter.on('change', function() {

        currentStatus = $(this).val();
        loadUsers(0); // Filter එක වෙනස් කරද්දී, පළමු පිටුවට යනවා
    });

    // Event Delegation for Pagination Buttons
    paginationContainer.on('click', '#prevBtn', function() {
        if (currentPage > 0) {
            loadUsers(currentPage - 1);
        }
    });

    paginationContainer.on('click', '#nextBtn', function() {
        if (currentPage < totalPages - 1) {
            loadUsers(currentPage + 1);
        }
    });

    // ... (අනිත් event listeners ටික - suggestion click, document click etc.)

    // --- Initial Load ---
    loadUsers(0);



    // =======================================================
    // ===     SUSPEND / ACTIVATE USER (jQuery AJAX)       ===
    // =======================================================

    // Event Delegation for action buttons
    userTableBody.on('click', '.action-btn', function() {
        
        const clickedButton = $(this);
        const userId = clickedButton.data('user-id');
        const isSuspendButton = clickedButton.hasClass('action-suspend');
        
        const action = isSuspendButton ? 'suspend' : 'activate';


        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, suspend it!"
        }).then((result) => {

            if (!result.isConfirmed) {
                return;
            }

            // --- jQuery AJAX Call ---
            $.ajax({
                url: 'http://localhost:8080/user_manage/' + userId + '/' + action,
                method: 'PATCH', // Using PATCH method
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                success: function(response) {

                    Swal.fire({
                        title: "Deleted!",
                        text: response.message || 'Item suspended successfully..!',
                        icon: "success"
                    });

                    // --- Dynamically update the UI ---
                    const statusBadge = clickedButton.closest('tr').find('.status-badge');
                    
                    if (isSuspendButton) {
                        // Update UI to "Suspended" state
                        statusBadge.removeClass('status-active').addClass('status-suspended').text('SUSPENDED');
                        clickedButton.removeClass('action-suspend').addClass('action-activate')
                                    .html('<i class="fas fa-user-check"></i> Activate')
                                    .attr('title', 'Activate User');
                    } else {
                        // Update UI to "Active" state
                        statusBadge.removeClass('status-suspended').addClass('status-active').text('ACTIVE');
                        clickedButton.removeClass('action-activate').addClass('action-suspend')
                                    .html('<i class="fas fa-user-slash"></i> Suspend')
                                    .attr('title', 'Suspend User');
                    }
                },
                error: function(jqXHR) {
                    // This function runs if the server returns an error (e.g., 404, 500)
                    console.error(`Failed to ${action} user:`, jqXHR.responseText);
                    try {
                        const errorResponse = JSON.parse(jqXHR.responseText);

                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: `Error: ${errorResponse.message}`,
                        })

                    } catch(e) {
                        alert(`An unknown error occurred while trying to ${action} the user.`);
                    }
                }
            });
            
        });

        
        // Confirmation Dialog
        // if (!confirm(`Are you sure you want to ${action} this user?`)) {
        //     return; // Stop if the admin cancels
        // }

        
    });

    // =======================================================
    // ===       LOAD TOTAL USER COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalUserCount() {
        $.ajax({
            url: 'http://localhost:8080/user_manage/total_user_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                $('#totalUsersCount').text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                $('#totalUsersCount').text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalUserCount();

    $('#logoutBtn').on('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('authToken');
        
        Swal.fire({
            title: "Success!",
            icon: "success",
            text: 'You have been logged out successfully..!',
            draggable: true
        }).then(() => {
            window.location.href = 'loginpage.html';
        });

    });



});