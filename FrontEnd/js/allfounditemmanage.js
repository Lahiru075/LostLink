$(document).ready(function () {

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
    // ===       DYNAMIC HEADER GREETING SCRIPT      ===
    // ===============================================
    function updateHeaderGreeting() {
        const now = new Date();
        const hour = now.getHours();
        let greetingText;
        if (hour < 12) {
            greetingText = "Good Morning, Admin! ☀️";
        } else if (hour < 18) {
            greetingText = "Good Afternoon, Admin! 👋";
        } else {
            greetingText = "Good Evening, Admin! 🌙";
        }
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateText = now.toLocaleDateString('en-US', options);
        $('#greeting-title').text(greetingText);
        $('#greeting-date').text(dateText);
    }
    updateHeaderGreeting();


    // ===============================================
    // ===      ALL FOUND ITEMS MANAGEMENT SCRIPT    ===
    // ===============================================

    // --- Selectors ---
    const itemSearchInput = $('#itemSearch');
    const categoryFilter = $('#category-filter');
    const statusFilter = $('#status-filter');
    const itemsTableBody = $('#foundItemsTableBody');
    const paginationContainer = $('#paginationContainer');
    const totalItemsCountEl = $('#totalItemsCount');
    const suggestionsPanel = $('#suggestionsPanel');

    // --- State Management ---
    let currentPage = 0;
    let totalPages = 0;
    const pageSize = 4;

    // --- Debounce Function ---
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Function to Load Categories into Dropdown ---
    function loadCategories() {
        $.ajax({
            url: 'http://localhost:8080/found_item_manage/get_all_categories',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function (response) {

                categoryFilter.find('option:not(:first-child)').remove();
                response.data.forEach(category => {
                    const optionHtml = `<option value="${category.categoryName}">${category.categoryName}</option>`;
                    categoryFilter.append(optionHtml);
                });

            },
            error: function (err) {
                console.error("Failed to load categories:", err);
            }
        });
    }

    // --- Main Function to Load Found Items ---
    function loadFoundItems(page = 0) {
        currentPage = page;
        const searchKeyword = itemSearchInput.val().trim();
        const category = categoryFilter.val();
        const status = statusFilter.val();

        const filterData = {
            page: currentPage,
            size: pageSize
        };
        if (searchKeyword) filterData.search = searchKeyword;
        if (category && category !== 'all') filterData.category = category;
        if (status && status !== 'all') filterData.status = status;

        itemsTableBody.html('<tr><td colspan="6" class="text-center">Loading items...</td></tr>');

        $.ajax({
            url: 'http://localhost:8080/found_item_manage/found_items',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            success: function (response) {
                itemsTableBody.empty();

                const pageData = response.data;
                const itemList = pageData.content;
                totalPages = pageData.totalPages;

                if (itemList.length === 0) {
                    itemsTableBody.append('<tr><td colspan="6" class="text-center">No found items found matching your criteria.</td></tr>');
                } else {
                    itemList.forEach(item => {
                        const statusClass = item.status ? item.status.toLowerCase() : 'unknown';
                        const dateFoundFormatted = new Date(item.dateFound).toLocaleDateString('en-CA');

                        const itemRowHtml = `
                            <tr>
                                <td>
                                    <div class="item-cell">
                                        <img src="${item.itemImageUrl || 'https://via.placeholder.com/60x40'}" class="item-thumbnail" alt="${item.title}">
                                        <div class="item-cell-info">
                                            <span class="item-title">${item.title}</span>
                                            <span class="item-description">${item.description}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${item.finderProfileImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic" alt="Finder">
                                        <span class="user-name">${item.finderFullName}</span>
                                    </div>
                                </td>
                                <td>${item.categoryName}</td>
                                <td>${dateFoundFormatted}</td>
                                <td><span class="status-badge status-${statusClass}">${item.status}</span></td>
                                <td class="text-center">
                                    <div class="action-menu">
                                        <button class="action-btn action-view" title="View Details" data-item-id="${item.id}"><i class="fas fa-eye"></i></button>
                                        <button class="action-btn action-delete" title="Delete Report" data-item-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        itemsTableBody.append(itemRowHtml);
                    });
                }
                loadTotalItemCount();
                renderPagination(pageData.totalElements, itemList.length);
            },
            error: function (err) {
                console.error("Failed to load found items", err);
                itemsTableBody.html('<tr><td colspan="6" class="text-center">Failed to load data. Please try again.</td></tr>');
                paginationContainer.hide();
            }
        });
    }

    // --- Render Pagination Function ---
    function renderPagination(totalItems, currentEntryCount) {
        if (!totalItems || totalItems <= 0 || totalPages <= 1) {
            paginationContainer.hide();
            return;
        }

        const startEntry = currentPage * pageSize + 1;
        const endEntry = startEntry + currentEntryCount - 1;

        const paginationInfoEl = paginationContainer.find('#paginationInfo');
        const prevBtnEl = paginationContainer.find('#prevBtn');
        const nextBtnEl = paginationContainer.find('#nextBtn');

        paginationInfoEl.text(`Showing ${startEntry}-${endEntry} of ${totalItems}`);
        prevBtnEl.prop('disabled', currentPage === 0);
        nextBtnEl.prop('disabled', currentPage >= totalPages - 1);

        paginationContainer.show();
    }

    // --- Get Search Suggestions Function ---
    function getSuggestions(query) {
        if (query.length < 2) {
            suggestionsPanel.empty().hide();
            return;
        }
        $.ajax({
            url: 'http://localhost:8080/found_item_manage/found_items/suggestions',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: { query: query },
            success: function (response) {
                suggestionsPanel.empty();

                response.data.forEach(title => {
                    const item = $(`<div class="suggestion-item">${title}</div>`);
                    item.on('click', function () {
                        itemSearchInput.val(title);
                        suggestionsPanel.hide();
                        loadFoundItems(0);
                    });
                    suggestionsPanel.append(item);
                });
                suggestionsPanel.show();

            },
            error: function (err) {
                console.error("Failed to fetch suggestions:", err);
                suggestionsPanel.hide();
            }
        });
    }

    // --- Event Listeners ---
    itemSearchInput.on('input', debounce(function () { getSuggestions($(this).val()); }, 400));
    itemSearchInput.on('keyup', function (e) {
        if (e.key === 'Enter' || $(this).val() === '') {
            suggestionsPanel.hide();
            loadFoundItems(0);
        }
    });
    categoryFilter.on('change', () => loadFoundItems(0));
    statusFilter.on('change', () => loadFoundItems(0));

    paginationContainer.on('click', '#prevBtn', () => { 
        if (currentPage > 0) loadFoundItems(currentPage - 1); 
    });
    
    paginationContainer.on('click', '#nextBtn', () => { 
        if (currentPage < totalPages - 1) loadFoundItems(currentPage + 1); 
    });
    
    $(document).on('click', function (e) { 
        if (!$(e.target).closest('.search-bar-local').length) { suggestionsPanel.hide(); 

        } 
    });

    // TODO: Add Event Delegation for action buttons (View, Flag, Delete) for FOUND items.

    // --- Initial Load ---
    loadCategories();
    loadFoundItems(0);

    // =======================================================
    // ===       LOAD TOTAL Item COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalItemCount() {
        $.ajax({
            url: 'http://localhost:8080/found_item_manage/total_item_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                totalItemsCountEl.text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                totalItemsCountEl.text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalItemCount();


    // =======================================================
    // ===           DELETE ITEM (jQuery AJAX)             ===
    // =======================================================

    // Event Delegation for the delete button
    itemsTableBody.on('click', '.action-delete', function() {
        
        const clickedButton = $(this);
        const itemId = clickedButton.data('item-id');
        const itemRow = clickedButton.closest('tr'); // Get the table row to remove it later

        // 1. Confirmation Dialog
        // if (!confirm('Are you sure you want to permanently delete this item report? This action cannot be undone.')) {
        //     return; // Stop if the admin cancels
        // }

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            
            if (!result.isConfirmed) {
                return;
            }

            // 2. AJAX Call using DELETE method
            $.ajax({
                url: `http://localhost:8080/found_item_manage/delete/${itemId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                success: function(response) {
                    // This function runs on a successful response (200 OK)

                    Swal.fire({
                        title: "Deleted!",
                        text: response.message || 'Item deleted successfully..!',
                        icon: "success"
                    });

                    // 3. Dynamically update the UI
                    
                    // Fade out the row and then remove it from the DOM
                    itemRow.fadeOut(400, function() {
                        $(this).remove();
                    });

                    loadFoundItems(0);

                },
                error: function(jqXHR) {
                    // This function runs if the server returns an error
                    console.error('Failed to delete item:', jqXHR.responseText);
                    try {
                        const errorResponse = JSON.parse(jqXHR.responseText);

                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: `Error: ${errorResponse.message}..!`,
                        })

                    } catch(e) {

                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: 'An error occurred while trying to delete the item..!',
                        })
                    }
                }
            });

        });


        
    });

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