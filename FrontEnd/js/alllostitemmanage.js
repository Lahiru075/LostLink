$(document).ready(function() {

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
    // ===      ALL LOST ITEMS MANAGEMENT SCRIPT     ===
    // ===============================================

    // --- Selectors ---
    const itemSearchInput = $('#itemSearch');
    const categoryFilter = $('#category-filter');
    const statusFilter = $('#status-filter');
    const itemsTableBody = $('#lostItemsTableBody');
    const paginationContainer = $('#paginationContainer');
    const totalItemsCountEl = $('#totalItemsCount');
    const suggestionsPanel = $('#suggestionsPanel');

    // --- State Management ---
    let currentPage = 0;
    let totalPages = 0;
    const pageSize = 4; // එක පිටුවක පෙන්වන items ගණන

    // --- Debounce Function (API calls අඩු කිරීමට) ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Main Function to Load Lost Items ---
    function loadLostItems(page = 0) {
        currentPage = page;

        // Collect current filters into an object
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

        // Show a loading state in the table
        itemsTableBody.html('<tr><td colspan="6" class="text-center">Loading items...</td></tr>');

        $.ajax({
            url: 'http://localhost:8080/lost_item_manage/lost_items',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            
            success: function(response) {
                itemsTableBody.empty();

                const pageData = response.data;
                const itemList = pageData.content;
                const totalItems = pageData.totalElements;
                totalPages = pageData.totalPages;

                if (itemList.length === 0) {
                    itemsTableBody.append('<tr><td colspan="6" class="text-center">No lost items found matching your criteria.</td></tr>');
                } else {
                    itemList.forEach(item => {
                        const statusClass = item.status ? item.status.toLowerCase() : 'unknown';
                        const dateLostFormatted = new Date(item.dateLost).toLocaleDateString('en-CA'); // YYYY-MM-DD format

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
                                        <img src="${item.ownerProfileImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic" alt="Owner">
                                        <span class="user-name">${item.ownerFullName}</span>
                                    </div>
                                </td>
                                <td>${item.categoryName}</td>
                                <td>${dateLostFormatted}</td>
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

                renderPagination(totalItems, itemList.length);
            },
            error: function(err) {
                console.error("Failed to load lost items", err);
                itemsTableBody.html('<tr><td colspan="6" class="text-center">Failed to load data. Please try again.</td></tr>');
                paginationContainer.hide();
            }
        });
    }

    // =======================================================
    // ===        SEARCH SUGGESTIONS FUNCTIONALITY         ===
    // =======================================================

    function getSuggestions(query) {
        if (query.length < 2) {
            suggestionsPanel.empty().hide();
            return;
        }

        $.ajax({
            url: 'http://localhost:8080/lost_item_manage/lost_items/suggestions',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }, // Correct token key
            data: { query: query },
            success: function(response) {
                
                suggestionsPanel.empty();

                    response.data.forEach(title => {
                        const item = $(`<div class="suggestion-item">${title}</div>`);
                        item.on('click', function() {
                            itemSearchInput.val(title); // Select කරපු title එක search box එකට දානවා
                            suggestionsPanel.hide();
                            loadLostItems(0); // ඒ title එකෙන් search කරලා, table එක reload කරනවා
                        });
                        suggestionsPanel.append(item);
                    });
                    suggestionsPanel.show();

            },
            error: function(err) {
                console.error("Failed to fetch suggestions:", err);
                suggestionsPanel.hide();
            }
        });
    }

    // --- Render Pagination Function ---
    function renderPagination(totalItems, currentEntryCount) {
        // totalPages කියන global variable එක, loadLostItems function එකේදී update වෙනවා
        
        // If there's only one page worth of content or no users, hide the pagination
        if (!totalItems || totalItems <= 0 || totalPages <= 1) {
            paginationContainer.hide();
            return;
        }
        
        // Calculate the range of items being shown
        const startEntry = currentPage * pageSize + 1;
        const endEntry = startEntry + currentEntryCount - 1;
        
        // Select the elements inside the pagination container
        const paginationInfoEl = paginationContainer.find('#paginationInfo');
        const prevBtnEl = paginationContainer.find('#prevBtn');
        const nextBtnEl = paginationContainer.find('#nextBtn');

        // Update the info text (e.g., "Showing 1-10 of 1289")
        paginationInfoEl.text(`Showing ${startEntry}-${endEntry} of ${totalItems}`);
        
        // Enable or disable Previous/Next buttons based on the current page
        prevBtnEl.prop('disabled', currentPage === 0);
        nextBtnEl.prop('disabled', currentPage >= totalPages - 1);

        // Finally, make sure the container is visible
        paginationContainer.show();
    }


    


    // =======================================================
    // ===                 EVENT LISTENERS                 ===
    // =======================================================

    // --- Search Input: 'input' for suggestions, 'keyup' for Enter search ---
    
    // For showing suggestions as the user types
    itemSearchInput.on('input', debounce(function() {
        getSuggestions($(this).val());
    }, 400));

    // For triggering a full table search
    itemSearchInput.on('keyup', function(e) {
        // Search when 'Enter' is pressed or the input is cleared
        if (e.key === 'Enter' || $(this).val() === '') {
            suggestionsPanel.hide(); // Hide suggestions panel on search
            loadLostItems(0);
        }
    });

    // --- Filter Change Listeners ---
    categoryFilter.on('change', function() {
        loadLostItems(0); // Go back to first page on filter change
    });
    
    statusFilter.on('change', function() {
        loadLostItems(0); // Go back to first page on filter change
    });

    // --- Pagination Button Listeners (using Event Delegation) ---
    paginationContainer.on('click', '#prevBtn', function() {
        if (!$(this).is(':disabled') && currentPage > 0) {
            loadLostItems(currentPage - 1);
        }
    });

    paginationContainer.on('click', '#nextBtn', function() {
        if (!$(this).is(':disabled') && currentPage < totalPages - 1) {
            loadLostItems(currentPage + 1);
        }
    });
    
    // --- Hide suggestions when clicking outside the search area ---
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-bar-local').length) {
            suggestionsPanel.hide();
        }
    });

    // --- Initial Load ---
    loadLostItems(0);


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
                url: `http://localhost:8080/lost_item_manage/delete/${itemId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                success: function(response) {

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

                    loadLostItems(0);

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

        })

        
    });


    // =======================================================
    // ===       FUNCTION TO LOAD CATEGORIES INTO FILTER   ===
    // =======================================================
    function loadCategories() {
        const $categoryFilter = $('#category-filter');

        $.ajax({
            url: 'http://localhost:8080/lost_item_manage/get_all_categories',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                // Loop through the categories received from the backend
                response.data.forEach(category => {

                    // The 'value' will be the category name, as your search endpoint expects a name
                    const optionHtml = `<option value="${category.categoryName}">${category.categoryName}</option>`;
                    
                    // Add the new option to the dropdown
                    $categoryFilter.append(optionHtml);
                });
            },
            error: function(err) {
                console.error("Failed to load categories:", err);
                // If it fails, the dropdown will just show "All Categories", which is a safe fallback
            }
        });
    }


    loadCategories();



    // =======================================================
    // ===       LOAD TOTAL Item COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalItemCount() {
        $.ajax({
            url: 'http://localhost:8080/lost_item_manage/total_item_count', // අලුත් endpoint එක
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