
$(document).ready(function () {

    // =================================================================
    // === 1. MODAL SCRIPTING (jQuery Version) ===
    // =================================================================
    const $reportItemModal = $('#reportItemModal'); // Prefix with $ for jQuery objects
    const $addItemBtn = $('.add-item-btn');
    const $closeModalBtn = $('#closeModalBtn');
    const $cancelBtn = $('#cancelBtn');

    function openModal() {
        $reportItemModal.addClass('active');
    }

    function closeModal() {
        $reportItemModal.removeClass('active');
    }

    $addItemBtn.on('click', openModal);
    $closeModalBtn.on('click', closeModal);
    $cancelBtn.on('click', closeModal);
    $(window).on('click', function (event) {
        if ($(event.target).is($reportItemModal)) {
            closeModal();
        }
    });

    // =================================================================
    // === 2. IMAGE PREVIEW SCRIPTING (jQuery Version) ===
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
            $(reader).on('load', function () {
                $imagePreview.attr('src', this.result);
            });
            reader.readAsDataURL(file);
        }
    });

    // =================================================================
    // === 3. LOCATIONIQ AUTOCOMPLETE SCRIPTING (jQuery Version) ===
    // =================================================================
    const $searchInput = $('#locationSearch');
    const $suggestionsPanel = $('#suggestionsPanel');

    // Debounce function remains the same (it's pure JavaScript)
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function getSuggestions(query) {
        if (query.length < 3) {
            $suggestionsPanel.empty().hide();
            return;
        }
        const apiKey = ''; // Replace with your key
        const url = `https://api.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=LK`;
        $.ajax({
            url: url,
            method: 'GET',
            success: function (data) {
                displaySuggestions(data);
            },
            error: function (err) {
                console.error('Failed to fetch suggestions:', err);
            }
        });
    }

    // Function to display suggestions (no changes)
    function displaySuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) {
            $suggestionsPanel.hide();
            return;
        }
        $suggestionsPanel.empty();
        $.each(suggestions, function (index, place) {
            const $suggestionDiv = $('<div>').addClass('suggestion-item')
                .html(`<i class="fas fa-map-marker-alt"></i> ${place.display_name}`);

            $suggestionDiv.on('click', function () {
                $searchInput.val(place.display_name);
                $('#latitude').val(place.lat);
                $('#longitude').val(place.lon);
                $suggestionsPanel.empty().hide();
            });

            $suggestionsPanel.append($suggestionDiv);
        });
        $suggestionsPanel.show();
    }

    // Event listener for the input field (no changes)
    $searchInput.on('input', debounce(() => getSuggestions($searchInput.val()), 300));

    // Event listener to hide the panel (no changes)
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#locationSearch, .suggestions-panel').length) {
            $suggestionsPanel.hide();
        }
    });


    // =================================================================
    // === 4. FORM SUBMISSION (jQuery Version) ===
    // =================================================================
    $('#reportItemForm').on('submit', function (event) {
        event.preventDefault();

        // FormData is still the best way to handle files
        const formData = new FormData(this);
        // You can append other fields if needed, but the form automatically includes them if they have a 'name' attribute
        formData.append('latitude', $('#latitude').val());
        formData.append('longitude', $('#longitude').val());
        formData.append('locationText', $('#locationSearch').val());

        console.log("Form Data to be sent to backend:");
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        alert('Form submitted! Check the browser console for the data.');

        closeModal();
    });

    
    const $itemsGrid = $('.items-grid');
    const authToken = localStorage.getItem('authToken');

    // Function to fetch and display lost items
    function loadLostItems() {
        // First, check if the user is logged in (has a token)
        if (!authToken) {
            console.error("Authentication token not found. User might be logged out.");
            $itemsGrid.html('<p class="error-message">You are not logged in. Please <a href="login.html">login</a> to see your items.</p>');
            return;
        }

        // Show a user-friendly loading message
        $itemsGrid.html('<p class="loading-message">Loading your reported items...</p>');

        $.ajax({
            
            url: 'http://localhost:8080/lost_item/get',
            method: 'GET',
            headers: {
                
                'Authorization': 'Bearer ' + authToken
            },
            success: function (response) {
        
                $itemsGrid.empty();

                if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                    
                    $.each(response.data, function (index, item) {
                        
                        const imageUrl = `http://localhost:8080/uploads/${item.imageUrl}`;
                        
                        const statusClass = item.status === 'ACTIVE' ? 'status-active' : 'status-recovered';
                        const statusText = item.status === 'ACTIVE' ? 'Active' : 'Recovered';
                        
                        let actionButtonsHtml = '';
                        if (item.status === 'ACTIVE') {
                            actionButtonsHtml = `
                                <button class="action-btn btn-edit" data-item-id="${item.lostItemId}"><i class="fas fa-pencil-alt"></i> Edit</button>
                                <button class="action-btn btn-delete" data-item-id="${item.lostItemId}"><i class="fas fa-trash-alt"></i> Delete</button>
                            `;
                        } else {
                            actionButtonsHtml = `
                                <button class="action-btn btn-view-details" data-item-id="${item.lostItemId}"><i class="fas fa-eye"></i> View Details</button>
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
                                    <p class="item-detail"><i class="fas fa-calendar-alt"></i> Reported on: ${item.lostDate}</p>
                                    <p class="item-detail"><i class="fas fa-tags"></i> Category: ${item.categoryName}</p>
                                </div>
                                <div class="card-actions">
                                    ${actionButtonsHtml}
                                </div>
                            </div>
                        `;
                        
                        // Append the newly created card to the grid container
                        $itemsGrid.append(cardHtml);
                    });

                } else {
                    // If no items are found, display a user-friendly message
                    $itemsGrid.html('<p class="no-items-message">You haven\'t reported any lost items yet. Click "Report New Lost Item" to get started!</p>');
                }
            },
            error: function (jqXHR) {
                console.error('Failed to fetch items:', jqXHR.responseText);
                // Handle different error types, like 403 Forbidden (token expired)
                if (jqXHR.status === 403) {
                     $itemsGrid.html('<p class="error-message">Your session has expired. Please <a href="login.html">login</a> again.</p>');
                } else {
                     $itemsGrid.html('<p class="error-message">Could not load your items. Please try refreshing the page.</p>');
                }
            }
        });
    }


    $itemsGrid.on('click', '.btn-delete', function() {
        const itemId = $(this).data('item-id');
        if (confirm(`Are you sure you want to permanently delete this report?`)) {
            
            alert(`Calling DELETE API for item ID: ${itemId}`);
            
        }
    });

    $itemsGrid.on('click', '.btn-edit', function() {
        const itemId = $(this).data('item-id');
        
        alert(`Calling GET API for item ID ${itemId} to pre-fill the edit form.`);
    });


    loadLostItems();



    $('#submitReportBtn').on('click', function () {

        const formData = new FormData();

        formData.append('title', $('#itemTitle').val());
        formData.append('categoryName', "Electronics");
        formData.append('description', $('#itemDescription').val());
        formData.append('lostDate', $('#lostDate').val());
        formData.append('latitude', $('#latitude').val());
        formData.append('longitude', $('#longitude').val());
        formData.append('status', "ACTIVE");

        const imageFile = $('#itemImage')[0].files[0];

        if (imageFile) {
            formData.append('image', imageFile);
        } else {
            alert('Please select an image to upload.');
            return; 
        }


        console.log("Form Data to be sent to backend:");
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        $.ajax({
            url: 'http://localhost:8080/lost_item/save',
            type: 'POST',
            data: formData,

             headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken') 
            },

            processData: false, 
            contentType: false, 


            success: function (response) {
                console.log('Success:', response);
                alert(response.message || 'Lost item reported successfully!'); 

                closeModal();
                $('#reportItemForm')[0].reset();

                const $imagePreview = $('#imagePreview').find('.image-preview-image');
                const $imagePreviewText = $('#imagePreview').find('.image-preview-text');
                $imagePreview.attr('src', '');
                $imagePreview.hide();
                $imagePreviewText.show();

                loadLostItems();

            },
            error: function (jqXHR, textStatus, errorThrown, error) {
                console.error('Error:', jqXHR.responseText);
                
                try {
                    const errorResponse = JSON.parse(jqXHR.responseText);
                    alert('Error: ' + (errorResponse.message || 'Something went wrong!'));
                } catch (e) {
                    alert('An unknown error occurred. Please check the console.');
                }
            }
        });
    });

});
