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

    // =======================================================
    // ===            CATEGORY MODAL CONTROLS              ===
    // =======================================================

    // --- Selectors ---
    const $categoryModal = $('#categoryModal');
    const $addCategoryBtn = $('#addCategoryBtn');
    const $closeCategoryModalBtn = $('#closeCategoryModalBtn');
    const $cancelCategoryBtn = $('#cancelCategoryBtn');
    const $categoryForm = $('#categoryForm');
    const $modalTitle = $('#modalTitle');

    // --- Helper Function to clear and reset the form ---
    function clearAndResetModal() {
        $categoryForm[0].reset(); // Reset form fields
        $('#categoryId').val(''); // Ensure hidden ID is cleared
        $modalTitle.text('Add New Category'); // Reset title to default
    }

    // --- Function to open the modal ---
    function openModal() {
        $categoryModal.addClass('active');
    }

    // --- Function to close the modal ---
    function closeModal() {
        $categoryModal.removeClass('active');
    }

    // --- Event Listeners ---

    // 1. "Add New Category" button click event
    $addCategoryBtn.on('click', function() {
        clearAndResetModal(); // Clear any old data from previous edits
        openModal();
    });

    // 2. Close button (X icon) click event
    $closeCategoryModalBtn.on('click', function() {
        closeModal();
    });

    // 3. Cancel button click event
    $cancelCategoryBtn.on('click', function() {
        closeModal();
    });

    // 4. Clicking on the dark background to close the modal
    $categoryModal.on('click', function(event) {
        // Check if the click was on the overlay itself, not on the modal content
        if ($(event.target).is($categoryModal)) {
            closeModal();
        }
    });





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

    
    
    // --- Selectors ---
    const searchInput = $('#categorySearch');
    const tableBody = $('#categoriesTableBody');
    const paginationContainer = $('#paginationContainer');
    const suggestionsPanel = $('#suggestionsPanel'); // Make sure this div exists in your HTML

    // --- State Management ---
    let currentPage = 0;
    let totalPages = 0;
    const pageSize = 2;

    // --- Debounce Function ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Main Function to Load Categories ---
    function loadCategories(page = 0) {
        currentPage = page;
        const searchKeyword = searchInput.val().trim();

        const filterData = {
            page: currentPage,
            size: pageSize
        };
        if (searchKeyword) filterData.search = searchKeyword;

        tableBody.html('<tr><td colspan="4" class="text-center">Loading categories...</td></tr>');

        $.ajax({
            url: 'http://localhost:8080/categories/all_categories',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            success: function(response) {


                
                tableBody.empty();

                // --- Response එකෙන් data සහ pagination details ගන්නවා ---
                const paginatedData = response.data;
                const categoryList = paginatedData.content;
                const totalCategories = paginatedData.totalElements;
                totalPages = paginatedData.totalPages;

                if (categoryList.length === 0) {
                    tableBody.append('<tr><td colspan="4" class="text-center">No categories found.</td></tr>');
                } else {
                    categoryList.forEach(category => {
                        const categoryRowHtml = `
                            <tr>
                                <td>${category.categoryId}</td>
                                <td>${category.categoryName}</td>
                                <td>${category.description || 'N/A'}</td>
                                <td class="text-center">
                                    <div class="action-menu">
                                        <button class="action-btn action-edit" title="Edit Category" data-id="${category.categoryId}" data-name="${category.categoryName}" data-description="${category.description || ''}">
                                            <i class="fas fa-pencil-alt"></i>
                                        </button>
                                        <button class="action-btn action-delete" title="Delete Category" data-id="${category.categoryId}">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        tableBody.append(categoryRowHtml);
                    });
                }
                
                renderPagination(totalCategories, categoryList.length);
            },
            error: function(err) {
                console.error("Failed to load categories", err);
                tableBody.html('<tr><td colspan="4" class="text-center">Failed to load data. Please try again.</td></tr>');
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
        
        paginationContainer.html(`
            <span id="paginationInfo">Showing ${startEntry}-${endEntry} of ${totalItems}</span>
            <div class="pagination-buttons">
                <button class="btn-pagination" id="prevBtn" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
                <button class="btn-pagination" id="nextBtn" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>Next</button>
            </div>
        `);
        paginationContainer.show();
    }

    // --- Get Search Suggestions Function ---
    function getSuggestions(query) {
        if (query.length < 2) {
            suggestionsPanel.empty().hide();
            return;
        }
        $.ajax({
            url: 'http://localhost:8080/categories/suggestions',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: { query: query },
            success: function(response) {
                suggestionsPanel.empty();
               
                response.data.forEach(name => {
                    const item = $(`<div class="suggestion-item">${name}</div>`);
                    item.on('click', function() {
                        searchInput.val(name);
                        suggestionsPanel.hide();
                        loadCategories(0);
                    });
                    suggestionsPanel.append(item);
                });
                suggestionsPanel.show();
              
            }
        });
    }

    // --- Event Listeners ---
    searchInput.on('input', debounce(function() { getSuggestions($(this).val()); }, 400));
    searchInput.on('keyup', function(e) {
        if (e.key === 'Enter' || $(this).val() === '') {
            suggestionsPanel.hide();
            loadCategories(0);
        }
    });
    
    paginationContainer.on('click', '#prevBtn', () => { if (currentPage > 0) loadCategories(currentPage - 1); });
    paginationContainer.on('click', '#nextBtn', () => { if (currentPage < totalPages - 1) loadCategories(currentPage + 1); });
    
    $(document).on('click', function(e) { if (!$(e.target).closest('.search-bar-local').length) { suggestionsPanel.hide(); } });

    // --- Add/Edit/Delete Functionality (from previous answers) ---
    // ... (Your modal open/close logic)
    // ... (Your form submission logic for save/update)
    // ... (Your delete button logic)

    // --- Initial Load ---
    loadCategories(0);







    // =======================================================
    // ===       CATEGORY MODAL & CRUD OPERATIONS          ===
    // =======================================================

    // --- Selectors ---
    // const $categoryModal = $('#categoryModal');
    // const $addCategoryBtn = $('#addCategoryBtn');
    // const $closeCategoryModalBtn = $('#closeCategoryModalBtn');
    // const $cancelCategoryBtn = $('#cancelCategoryBtn');
    // const $categoryForm = $('#categoryForm');
    // const $modalTitle = $('#modalTitle');
    const $saveCategoryBtn = $('#saveCategoryBtn');
    // const tableBody = $('#categoriesTableBody');

    // --- Helper Function to clear and reset the modal ---
    function clearAndResetModal() {
        $categoryForm[0].reset();
        $('#categoryId').val(''); // Clear the hidden ID
        $modalTitle.text('Add New Category');
        $saveCategoryBtn.text('Save Category');
        $saveCategoryBtn.prop('disabled', false); // Re-enable button
    }

    // --- Modal Controls ---
    function openModal() { $categoryModal.addClass('active'); }
    function closeModal() { $categoryModal.removeClass('active'); }

    // --- Event Listeners for Modal ---
    $addCategoryBtn.on('click', function() {
        clearAndResetModal();
        openModal();
    });
    $closeCategoryModalBtn.on('click', closeModal);
    $cancelCategoryBtn.on('click', closeModal);
    $categoryModal.on('click', function(event) {
        if ($(event.target).is($categoryModal)) {
            closeModal();
        }
    });

    // --- EDIT BUTTON CLICK (Event Delegation) ---
    tableBody.on('click', '.action-edit', function() {
        const button = $(this);
        const id = button.data('id');
        const name = button.data('name');
        const description = button.data('description');

        // Populate modal fields
        $('#categoryId').val(id);
        $('#categoryName').val(name);
        $('#categoryDescription').val(description);

        // Update modal title and button for "Edit Mode"
        $modalTitle.text('Edit Category');
        $saveCategoryBtn.text('Update Category');
        
        openModal();
    });

    // --- SAVE / UPDATE FORM SUBMISSION LOGIC ---
    $saveCategoryBtn.on('click', function() {
        // 1. Determine if it's an EDIT or a SAVE
        const categoryId = $('#categoryId').val();
        const isEditMode = !!categoryId;

        // 2. Set up AJAX URL and Method
        const ajaxUrl = isEditMode
            ? `http://localhost:8080/categories/update/${categoryId}`
            : 'http://localhost:8080/categories/save';
            
        const ajaxMethod = isEditMode ? 'PUT' : 'POST';

        // 3. Collect form data into a JSON object
        const categoryData = {
            categoryName: $('#categoryName').val().trim(),
            description: $('#categoryDescription').val().trim()
        };
        
        // Basic validation
        if (!categoryData.categoryName) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: 'Category Name cannot be empty...!',
            })
            
            return;
        }

        // 4. Disable button to prevent multiple submissions
        const $thisButton = $(this);
        $thisButton.prop('disabled', true).text(isEditMode ? 'Updating...' : 'Saving...');

        // 5. Perform the AJAX call
        $.ajax({
            url: ajaxUrl,
            method: ajaxMethod,
            contentType: 'application/json', // We are sending JSON
            data: JSON.stringify(categoryData), // Convert JS object to JSON string
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function (response) {

                Swal.fire({
                    title: "Success!",
                    icon: "success",
                    text: response.message,
                    draggable: true
                })

                closeModal();
                loadCategories(0); // Reload the table to show changes
            },
            error: function (jqXHR) {
                const errorMsg = jqXHR.responseJSON ? jqXHR.responseJSON.message : "An error occurred.";

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Error: ${errorMsg}..!`,
                })

            },
            complete: function() {
                // Re-enable button
                $thisButton.prop('disabled', false);
            }
        });
    });

    // --- DELETE BUTTON CLICK (Event Delegation) ---
    tableBody.on('click', '.action-delete', function() {
        const categoryId = $(this).data('id');
        
        // if (!confirm('Are you sure you want to delete this category? This might affect existing items.')) {
        //     return;
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

            $.ajax({
                url: `http://localhost:8080/categories/delete/${categoryId}`,
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
                success: function(response) {
                    

                    Swal.fire({
                        title: "Deleted!",
                        text: response.message || 'Item deleted successfully..!',
                        icon: "success"
                    });

                    loadCategories(0); // Reload table
                },
                error: function(jqXHR) {
                    const errorMsg = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not delete the category.";
                    alert(`Error: ${errorMsg}`);

                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: `Error: ${errorMsg}`,
                    })

                }
            });

        });

    });

    // --- Initial Load ---
    loadCategories(0);


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