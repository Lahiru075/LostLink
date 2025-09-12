$(document).ready(function () {

    const $reportItemModal = $('#reportItemModal');
    const $addItemBtn = $('.add-item-btn');
    const $closeModalBtn = $('#closeModalBtn');
    const $cancelBtn = $('#cancelBtn');
    
    // Global variables for the map and marker, initialized to null
    let map = null;
    let marker = null;

    // =================================================================
    // === 2. MODAL CONTROLS (Updated to initialize map on open) ===
    // =================================================================
    function openModal() {
        $reportItemModal.addClass('active');
        // A small timeout to allow the modal animation to finish before rendering the map
        setTimeout(() => {
            if (map) {
                // This Leaflet function tells the map to re-calculate its size
                map.invalidateSize(); 
            }
        }, 100);
    }

    function closeModal() {
        $reportItemModal.removeClass('active');
    }

    // $addItemBtn.on('click', openModal);

    $addItemBtn.on('click', function() {
        openModal();

        initializeOrUpdateMap(6.9271, 79.8612, 12);
    });

    $closeModalBtn.on('click', closeModal);
    $cancelBtn.on('click', closeModal);
    $(window).on('click', function (event) {
        if ($(event.target).is($reportItemModal)) {
            closeModal();
        }
    });

    // =================================================================
    // === 3. IMAGE PREVIEW SCRIPTING (No changes needed) ===
    // =================================================================
    const $itemImageInput = $('#itemImage');
    const $imagePreviewContainer = $('#imagePreview');
    const $imagePreview = $imagePreviewContainer.find('.image-preview-image');
    const $imagePreviewText = $imagePreviewContainer.find('.image-preview-text');
    $itemImageInput.on('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            $imagePreviewText.hide();
            $imagePreview.show();
            $(reader).on('load', function () { $imagePreview.attr('src', this.result); });
            reader.readAsDataURL(file);
        }
    });

    // =================================================================
    // === 4. LEAFLET MAP & LOCATIONIQ SCRIPTING (THE CORE LOGIC) ===
    // =================================================================
    const $searchInput = $('#locationSearch');
    const $suggestionsPanel = $('#suggestionsPanel');

    // This new function creates the map if it doesn't exist, or updates it if it does.
    function initializeOrUpdateMap(lat, lng, zoom = 13) {
        if (!map) { // If map hasn't been created yet
            map = L.map('map-container').setView([lat, lng], zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);

            // Add event listeners ONLY when the map is first created
            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                updateCoordinates(e.latlng.lat, e.latlng.lng);
            });
            marker.on('dragend', function() {
                const newLatLng = marker.getLatLng();
                updateCoordinates(newLatLng.lat, newLatLng.lng);
            });
        } else { // If map already exists, just move its view and marker
            map.setView([lat, lng], zoom);
            marker.setLatLng([lat, lng]);
        }
        updateCoordinates(lat, lng);
    }
    
    // New helper function to update hidden lat/lng fields
    function updateCoordinates(lat, lng) {
        $('#latitude').val(lat);
        $('#longitude').val(lng);
    }

    // --- LocationIQ Autocomplete Logic (now connected to the map) ---
    function debounce(func, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; }

    function getSuggestions(query) {
        if (query.length < 3) { $suggestionsPanel.empty().hide(); return; }
        const apiKey = ''; 
        const url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=LK`;
        $.ajax({
            url: url, method: 'GET',
            success: function (data) { displaySuggestions(data); },
            error: function (err) { console.error('Failed to fetch suggestions:', err); }
        });
    }

    // This function is now UPDATED to call the map function
    function displaySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) { $suggestionsPanel.hide(); return; }
        $suggestionsPanel.empty();
        $.each(suggestions, function (index, place) {
            const $suggestionDiv = $('<div>').addClass('suggestion-item')
                .html(`<i class="fas fa-map-marker-alt"></i> ${place.display_name}`);

            $suggestionDiv.on('click', function () {
                $searchInput.val(place.display_name);
                $suggestionsPanel.empty().hide();
                
                // === THIS IS THE INTEGRATION POINT ===
                // When a suggestion is clicked, we tell our map to update
                initializeOrUpdateMap(parseFloat(place.lat), parseFloat(place.lon), 15);
            });

            $suggestionsPanel.append($suggestionDiv);
        });
        $suggestionsPanel.show();
    }

    $searchInput.on('input', debounce(() => getSuggestions($searchInput.val()), 300));
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#locationSearch, .suggestions-panel').length) {
            $suggestionsPanel.hide();
        }
    });




    const $itemsGrid = $('.items-grid');
    const authToken = localStorage.getItem('authToken');


    $('#submitReportBtn').on('click', function () {

        const editItemId = $('#reportItemForm').data('edit-item-id');
        const isEditMode = !!editItemId;

        const ajaxUrl = isEditMode 
            ? `http://localhost:8080/found_item/update/${editItemId}` 
            : 'http://localhost:8080/found_item/save';                
            
        const ajaxMethod = isEditMode ? 'PUT' : 'POST';

        const formData = new FormData();
        formData.append('title', $('#itemTitle').val());
        formData.append('categoryName', "Electronics");
        formData.append('description', $('#itemDescription').val());
        formData.append('foundDate', $('#foundDate').val());
        formData.append('latitude', $('#latitude').val());
        formData.append('longitude', $('#longitude').val());
        formData.append('status', $('#itemCategory').val());

        const imageFile = $('#itemImage')[0].files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        if (!isEditMode && !imageFile) {
            alert('Please select an image to upload for a new report.');
            return;
        }


        const $thisButton = $(this);
        $thisButton.prop('disabled', true).text(isEditMode ? 'Updating...' : 'Saving...');


        $.ajax({
            url: ajaxUrl,
            method: ajaxMethod,
            data: formData,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            processData: false,
            contentType: false,
            success: function (response) {
                const successMessage = isEditMode ? 'Item updated successfully!' : 'Item reported successfully!';
                alert(response.message || successMessage);
                
                closeModal();
                clearFormFields();
                loadFoundItems();
            },
            error: function (jqXHR) {
                console.error('Error:', jqXHR.responseText);
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "An unknown error occurred.";
                alert(`Error: ${errorMessage}`);
            },
            complete: function() {

                $thisButton.prop('disabled', false).text(isEditMode ? 'Update Report' : 'Submit Report');
            }
        });
    });



     $itemsGrid.on('click', '.btn-delete', function() {
        const itemId = $(this).data('item-id');
    });

    $itemsGrid.on('click', '.btn-edit', function() {
        const itemId = $(this).data('item-id');
    });



    $('.items-grid').on('click', '.btn-edit', function() {
        const itemId = $(this).data('item-id');

        console.log('Calling GET API for item ID', itemId);
        
        $.ajax({
            url: `http://localhost:8080/found_item/get2/${itemId}`, // A NEW endpoint to get a single item
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            success: function(response) {

                console.log(response);
                
        
                if (response && response.data) {
                    const item = response.data;
                    $('#itemTitle').val(item.title);
                    $('#itemCategory').val(item.categoryName); 
                    $('#itemDescription').val(item.description);
                    $('#foundDate').val(item.foundDate);
                    $('#latitude').val(item.latitude);
                    $('#longitude').val(item.longitude);

                    

                    const imageUrl = item.imageUrl;
                    $('#imagePreview .image-preview-image').attr('src', imageUrl).show();
                    $('#imagePreview .image-preview-text').hide();

                    $('#reportItemForm').data('edit-item-id', itemId);
                    
                    $('#reportItemModal .modal-header h2').text('Edit Lost Item');
                    $('#submitReportBtn').text('Update Report');

                    openModal();

                    if (item.latitude && item.longitude) {
                        initializeOrUpdateMap(parseFloat(item.latitude), parseFloat(item.longitude), 16);
                    }
                }
            },
            error: function() {
                alert('Error: Could not retrieve item details.');
            }
        });
    });



    $('.items-grid').on('click', '.btn-delete', function() {

        const itemId = $(this).data('item-id');
        const $cardToDelete = $(this).closest('.item-card'); 

        if (confirm(`Are you sure you want to permanently delete this item report? This action cannot be undone.`)) {
            
            $.ajax({

                url: `http://localhost:8080/found_item/delete/${itemId}`,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
                },
                
                success: function(response) {
                    console.log('Success:', response);
                    alert(response.message || 'Item deleted successfully!');
                    
                    $cardToDelete.fadeOut(400, function() {
                        $(this).remove();
                    });
                },
                
                error: function(jqXHR) {
                    console.error('Error:', jqXHR.responseText);
                    const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not delete the item.";
                    alert(`Error: ${errorMessage}`);
                }
            });
        }

    });


    function clearFormFields() {
        $('#itemTitle').val(''); 
        $('#itemCategory').val(''); 
        $('#itemDescription').val(''); 
        $('#lostDate').val(''); 
        $('#locationSearch').val(''); 
        $('#latitude').val(''); 
        $('#longitude').val(''); 
        $('#imagePreview').val(''); 
        $("#itemImage").val(""); 
        $("#imagePreview .image-preview-image").attr("src", "").hide(); 
        $("#imagePreview .image-preview-text").show(); // text show
        $('#submitReportBtn').prop('disabled', false).text('Submit');


    }



    // =================================================================
    // === 2. THE MAIN FUNCTION TO LOAD/RELOAD ITEM CARDS (GET AJAX) ===
    // =================================================================


    const $mainSearchInput = $('#searchInput'); 
    const $categoryFilter = $('#category-filter');
    const $statusFilter = $('#status-filter');
    const $searchSuggestions = $('#searchSuggestions');
    const $paginationContainer = $('#pagination-container');


    function loadFoundItems(page = 0) {
        if (!authToken) {
            $itemsGrid.html('<p class="error-message">Please <a href="login.html">login</a>.</p>');
            return;
        }

        $itemsGrid.html('<p class="loading-message">Loading items...</p>');
        $paginationContainer.empty();

        // Collect current filters
        const keyword = $mainSearchInput.val().trim();
        const category = $categoryFilter.val();
        const status = $statusFilter.val();

        const filterData = { page: page, size: 4 }; 
        if (keyword) filterData.keyword = keyword;
        if (category) filterData.categoryName = category;
        if (status) filterData.status = status;

        $.ajax({
            url: 'http://localhost:8080/found_item/items_for_status',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            data: filterData,
            success: function (response) {

                console.log(response);

                $itemsGrid.empty();
                const pageData = response.data;

                if (pageData && pageData.content && pageData.content.length > 0) {
                    $.each(pageData.content, function (index, item) {
                        const imageUrl = item.imageUrl;
                        const statusClass = item.status === 'ACTIVE' ? 'status-active' : 'status-returned';
                        const statusText = item.status === 'ACTIVE' ? 'Active' : 'Returned';
                        
                        let actionButtonsHtml = '';
                        if (item.status === 'ACTIVE') {
                            actionButtonsHtml = `
                                <button class="action-btn btn-edit" data-item-id="${item.foundItemId}"><i class="fas fa-pencil-alt"></i> Edit</button>
                                <button class="action-btn btn-delete" data-item-id="${item.foundItemId}"><i class="fas fa-trash-alt"></i> Delete</button>
                            `;
                        } else {
                            actionButtonsHtml = `
                                <button class="action-btn btn-view-details" data-item-id="${item.foundItemId}"><i class="fas fa-eye"></i> View Details</button>
                            `;
                        }
                        
                        const cardHtml = `
                            <div class="item-card">
                                <div class="card-image">
                                    <img src="${imageUrl}" alt="${item.title}">
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </div>
                                <div class="card-content">
                                    <h3>${item.title}</h3>
                                    <p class="item-detail"><i class="fas fa-calendar-alt"></i> Reported on: ${item.foundDate}</p>
                                    <p class="item-detail"><i class="fas fa-tags"></i> Category: ${item.categoryName}</p>
                                </div>
                                <div class="card-actions">
                                    ${actionButtonsHtml}
                                </div>
                            </div>
                        `;

                        $itemsGrid.append(cardHtml);
                    });
                    renderPagination(pageData.totalPages, pageData.number);
                } else {
                    $itemsGrid.html('<p class="no-items-message">No items found.</p>');
                }
            },
            error: function () {
                $itemsGrid.html('<p class="error-message">Could not load items.</p>');
            }
        });
    }

    // ========================== PAGINATION ==========================
    function renderPagination(totalPages, currentPage) {
        $paginationContainer.empty();
        if (totalPages <= 1) return;

        let paginationHtml = '<ul>';
        paginationHtml += `<li><a href="#" class="page-link ${currentPage === 0 ? 'disabled' : ''}" data-page="${currentPage - 1}">Previous</a></li>`;
        for (let i = 0; i < totalPages; i++) {
            paginationHtml += `<li><a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i + 1}</a></li>`;
        }
        paginationHtml += `<li><a href="#" class="page-link ${currentPage >= totalPages - 1 ? 'disabled' : ''}" data-page="${currentPage + 1}">Next</a></li>`;
        paginationHtml += '</ul>';
        $paginationContainer.html(paginationHtml);
    }

    // ========================== SUGGESTIONS ==========================
    function debounce(func, delay) {
        let timeout; 
        return function(...args) { 
            clearTimeout(timeout); 
            timeout = setTimeout(() => func.apply(this, args), delay); 
        }; 
    }

    function getSearchSuggestions(keyword) {
        if (keyword.length < 2) { 
            $searchSuggestions.hide().empty(); 
            return; 
        }
        $.ajax({
            url: 'http://localhost:8080/found_item/search_suggestion',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            data: { keyword: keyword },
            success: function(response) {
                $searchSuggestions.empty();
                let suggestions = response.data ? response.data : response; 
                if (suggestions && suggestions.length > 0) {
                    $.each(suggestions, function(i, title) {
                        const itemHtml = `<div class="suggestion-item">${title}</div>`;
                        $searchSuggestions.append(itemHtml);
                    });
                    $searchSuggestions.show();
                } else {
                    $searchSuggestions.hide();
                }
            },
            error: function() { $searchSuggestions.hide(); }
        });
    }

    // ========================== EVENTS ==========================
    $mainSearchInput.on('keyup', debounce(function() {
        const keyword = $(this).val().trim();

        if (keyword === "") {
            $searchSuggestions.hide().empty();
            loadFoundItems(0); // show all
        } else if (keyword.length >= 2) {
            getSearchSuggestions(keyword);
        } else {
            $searchSuggestions.hide().empty();
        }
    }, 400));

    $searchSuggestions.on('click', '.suggestion-item', function() {
        $mainSearchInput.val($(this).text());
        $searchSuggestions.hide().empty();
        loadFoundItems(0); 
    });

    $mainSearchInput.on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $searchSuggestions.hide().empty();
            loadFoundItems(0);
        }
    });

    $categoryFilter.on('change', () => loadFoundItems(0));
    $statusFilter.on('change', () => loadFoundItems(0));

    $paginationContainer.on('click', '.page-link', function(e) {
        e.preventDefault();
        const $this = $(this);
        if ($this.hasClass('disabled') || $this.hasClass('active')) return;
        const pageToLoad = $(this).data('page');
        loadFoundItems(pageToLoad);
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.search-bar').length) {
            $searchSuggestions.hide();
        }
    });

    // ========================== INITIAL LOAD ==========================
    loadFoundItems(0);



    // // Debounce function
    // function debounce(func, delay) {
    //     let timeout;
    //     return function(...args) {
    //         clearTimeout(timeout);
    //         timeout = setTimeout(() => func.apply(this, args), delay);
    //     };
    // }

    // // --- 1. Load Lost Items from backend ---
    // function loadfoundItems(keyword, status, category) {
    //     if (!authToken) {
    //         $itemsGrid.html('<p class="error-message">Please <a href="login.html">login</a>.</p>');
    //         return;
    //     }

    //     $itemsGrid.html('<p class="loading-message">Loading items...</p>');

    //     const filterData = {};
    //     if (keyword) filterData.keyword = keyword;
    //     if (status) filterData.status = status;
    //     if (category) filterData.category = category; // new

    //     $.ajax({
    //         url: 'http://localhost:8080/found_item/items_for_status',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: filterData,
    //         success: function(response) {
    //             $itemsGrid.empty();

    //             if (response && response.data && response.data.length > 0) {
    //                 $.each(response.data, function (index, item) {
    //                     const imageUrl = item.imageUrl;

    //                     const statusClass = item.status === 'ACTIVE' ? 'status-active' : 'status-returned';
    //                     const statusText = item.status === 'ACTIVE' ? 'Active' : 'Returned';
                        
    //                     let actionButtonsHtml = '';
    //                     if (item.status === 'ACTIVE') {
    //                         actionButtonsHtml = `
    //                             <button class="action-btn btn-edit" data-item-id="${item.foundItemId}"><i class="fas fa-pencil-alt"></i> Edit</button>
    //                             <button class="action-btn btn-delete" data-item-id="${item.foundItemId}"><i class="fas fa-trash-alt"></i> Delete</button>
    //                         `;
    //                     } else {
    //                         actionButtonsHtml = `
    //                             <button class="action-btn btn-view-details" data-item-id="${item.foundItemId}"><i class="fas fa-eye"></i> View Details</button>
    //                         `;
    //                     }
                        
    //                     const cardHtml = `
    //                         <div class="item-card">
    //                             <div class="card-image">
    //                                 <img src="${imageUrl}" alt="${item.title}">
    //                                 <span class="status-badge ${statusClass}">${statusText}</span>
    //                             </div>
    //                             <div class="card-content">
    //                                 <h3>${item.title}</h3>
    //                                 <p class="item-detail"><i class="fas fa-calendar-alt"></i> Reported on: ${item.foundDate}</p>
    //                                 <p class="item-detail"><i class="fas fa-tags"></i> Category: ${item.categoryName}</p>
    //                             </div>
    //                             <div class="card-actions">
    //                                 ${actionButtonsHtml}
    //                             </div>
    //                         </div>
    //                     `;

    //                     $itemsGrid.append(cardHtml);
    //                 });
    //             } else {
    //                 $itemsGrid.html('<p class="no-items-message">No items found matching your criteria.</p>');
    //             }
    //         },
    //         error: function () {
    //             $itemsGrid.html('<p class="error-message">Could not load items. Please try again.</p>');
    //         }
    //     });
    // }

    // // --- 2. Suggestions Loader ---
    // function getSearchSuggestions(keyword) {
    //     if (keyword.length < 2) {
    //         $searchSuggestions.hide().empty();
    //         return;
    //     }

    //     $.ajax({
    //         url: 'http://localhost:8080/found_item/search_suggestion',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: { keyword: keyword },
    //         success: function(response) {
    //             console.log("Suggestions:", response);

    //             $searchSuggestions.empty();

    //             let suggestions = response.data ? response.data : response; // handle both formats

    //             if (suggestions && suggestions.length > 0) {
    //                 $.each(suggestions, function(i, title) {
    //                     const itemHtml = `<div class="suggestion-item">${title}</div>`;
    //                     $searchSuggestions.append(itemHtml);
    //                 });
    //                 $searchSuggestions.show();
    //             } else {
    //                 $searchSuggestions.hide();
    //             }
    //         },
    //         error: function() { $searchSuggestions.hide(); }
    //     });
    // }


    // function loadFilteredItems(keyword = "", status = "", category = "") {
    //     loadfoundItems(keyword, status, category);
    // }

    // // --- 1. Search box typing (with debounce) ---
    // $mainSearchInput.on('keyup', debounce(function() {
    //     const keyword = $(this).val().trim();
    //     const status = $statusFilter.val();
    //     const category = $categoryFilter.val(); // new

    //     if (keyword === "") {
    //         $searchSuggestions.hide().empty();
    //         loadFilteredItems("", status, category);
    //     } else {
    //         getSearchSuggestions(keyword);
    //     }
    // }, 400));

    // // --- 2. Suggestion click ---
    // $searchSuggestions.on('click', '.suggestion-item', function() {
    //     const keyword = $(this).text();
    //     $mainSearchInput.val(keyword);
    //     $searchSuggestions.hide().empty();

    //     const status = $statusFilter.val();
    //     const category = $categoryFilter.val();
    //     loadFilteredItems(keyword, status, category);
    // });

    // // --- 3. Pressing Enter in search box ---
    // $mainSearchInput.on('keypress', function(e) {
    //     if (e.which === 13) {
    //         e.preventDefault();
    //         $searchSuggestions.hide().empty();

    //         const keyword = $mainSearchInput.val().trim();
    //         const status = $statusFilter.val();
    //         const category = $categoryFilter.val();
    //         loadFilteredItems(keyword, status, category);
    //     }
    // });

    // // --- 4. Status dropdown change ---
    // $statusFilter.on('change', function() {
    //     const keyword = $mainSearchInput.val().trim();
    //     const status = $(this).val();
    //     const category = $categoryFilter.val();
    //     loadFilteredItems(keyword, status, category);
    // });

    // // --- 5. Category dropdown change ---
    // $categoryFilter.on('change', function() {
    //     const keyword = $mainSearchInput.val().trim();
    //     const status = $statusFilter.val();
    //     const category = $(this).val();
    //     loadFilteredItems(keyword, status, category);
    // });

    // // --- 6. Initial Load ---
    // loadfoundItems("", "", "");



    // =================================================================
    // === FUNCTION TO DYNAMICALLY LOAD CATEGORIES INTO THE DROPDOWN ===
    // =================================================================
    const $modalCategorySelect = $('#itemCategory'); // The select in the modal

    function loadCategories() {
        $.ajax({
            // === This is the new API endpoint we just created ===
            url: 'http://localhost:8080/categories/all_category_names',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            // No auth token needed if it's a public endpoint
            
            success: function(response) {


                if (response && response.data && response.data.length > 0) {
                    // Clear any existing options except the first one ("All Categories")
                    $categoryFilter.find('option:not(:first-child)').remove();
                    $modalCategorySelect.find('option:not(:first-child)').remove();

                    // Loop through the categories received from the backend
                    $.each(response.data, function(index, category) {
                        // Create a new <option> element
                        // The 'value' will be the category name, which your search endpoint expects
                        const optionHtml = `<option value="${category.categoryName}">${category.categoryName}</option>`;
                        
                        // Add the new option to BOTH dropdowns
                        $categoryFilter.append(optionHtml);
                        $modalCategorySelect.append(optionHtml);
                    });
                }
            },
            error: function() {
                console.error("Could not load categories. Using default options.");
            }
        });
    }


    // --- INITIAL LOAD ---
    // At the end of your document.ready, where you call loadLostItems()
    loadCategories(); // Call this function to populate dropdowns on page load

});

