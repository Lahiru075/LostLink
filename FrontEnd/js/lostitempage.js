
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
        const apiKey = 'pk.a95efca3c4d0ef92f09d20299a4bb659'; // Replace with your key
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

}); // End of document ready function
