function openTab(event, tabName) {
    $('.tab-content').removeClass('active');
    $('.main-tab-link').removeClass('active');
    $('#' + tabName).addClass('active');
    $(event.currentTarget).addClass('active');
}


$(document).ready(function () {



    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = 'login.html';
        return;
    }


    const urlParams = new URLSearchParams(window.location.search);
    const tabToOpen = urlParams.get('open_tab'); // This will be 'lost' or 'found'

    // Check if the 'open_tab' parameter exists
    if (tabToOpen === 'found') {
        // If it's 'found', click the "Found Item Matches" tab button
        $('button[onclick*="FoundItemMatches"]').click();
    } else {
        // For 'lost' or any other case (including no parameter),
        // click the "Lost Item Matches" tab button by default.
        $('button[onclick*="LostItemMatches"]').click();
    }

    // --- Now, load the data for both tabs as usual ---
    loadLostItemMatches();
    loadFoundItemMatches();

    
    const $mapViewModal = $('#mapViewModal');
    const $closeMapModalBtn = $('#closeMapModalBtn');
    let comparisonMap = null; // Variable to hold the map instance

    // Function to open the map modal
    function openMapModal() {
        $mapViewModal.addClass('active');
    }

    // Function to close the map modal
    function closeMapModal() {
        $mapViewModal.removeClass('active');
    }

    $closeMapModalBtn.on('click', closeMapModal);

    // Event listener for the "View Location on Map" button
    $('.matches-list').on('click', '.btn-view-location', function() {
        const $button = $(this);
        // Get all four coordinates from the button's data attributes
        const lostLat = $button.data('lost-lat');
        const lostLng = $button.data('lost-lng');
        const foundLat = $button.data('found-lat');
        const foundLng = $button.data('found-lng');
        
        openMapModal();
        
        // A small timeout to ensure the modal is visible before the map renders
        setTimeout(function() {
            // If the map hasn't been created yet, create it
            if (!comparisonMap) {
                comparisonMap = L.map('location-comparison-map');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(comparisonMap);
            }

            // Clear any old markers/lines from the map
            comparisonMap.eachLayer(function (layer) {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    comparisonMap.removeLayer(layer);
                }
            });

            // Create LatLng objects
            const lostLatLng = L.latLng(lostLat, lostLng);
            const foundLatLng = L.latLng(foundLat, foundLng);

            // Add markers for Lost and Found locations
            L.marker(lostLatLng).addTo(comparisonMap).bindPopup("<b>Item Lost Location</b>").openPopup();
            L.marker(foundLatLng).addTo(comparisonMap).bindPopup("<b>Matched Found Location</b>");

            // Draw a line between the two points
            L.polyline([lostLatLng, foundLatLng], {color: 'red'}).addTo(comparisonMap);

            // Automatically zoom and center the map to fit both markers
            comparisonMap.fitBounds([lostLatLng, foundLatLng], { padding: [50, 50] });

        }, 200);
    });


    // --- Function to Load Matches for LOST Items ---
    function loadLostItemMatches() {
        const $listContainer = $('#lost-matches-list');
        $listContainer.html('<p class="loading-message">Loading matches for your lost items...</p>');

        $.ajax({
            url: 'http://localhost:8080/matching/get_lost_matches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            success: function (response) {
                
                $listContainer.empty();
                if (response.data && response.data.length > 0) {
                    $.each(response.data, function (i, match) {

                        console.log(match);

                        let footerHtml = '';
                        if (match.status === 'PENDING_ACTION') {
                            footerHtml = `<span class="status-badge status-action">Action Needed</span><div class="action-buttons"><a href="#" class="text-link">Not a Match</a><button class="btn-primary btn-send-request" data-match-id="${match.matchId}">Send Contact Request</button></div>`;
                        } else if (match.status === 'REQUEST_SENT') {
                            footerHtml = `<span class="status-badge status-sent">Request Sent</span><div class="action-buttons"><p class="awaiting-text">Awaiting response...</p></div>`;
                        } else if (match.status === 'ACCEPTED') {
                            // === THIS IS THE NEW PART FOR THE LOSER ===
                            footerHtml = `
                                <span class="status-badge status-accepted">ACCEPTED</span>
                                <div class="action-buttons">
                                    <button class="btn-success btn-view-contact" data-match-id="${match.matchId}">
                                        <i class="fas fa-phone-alt"></i> View Finder's Contact
                                    </button>
                                </div>
                            `;
                        } else { // DECLINED
                            footerHtml = `<span class="status-badge status-declined">Declined</span>`;
                        }



                        const cardHtml = `
                            <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
                                <div class="card-header">
                                    <h3>Potential owner for the '${match.foundItemTitle}' you found</h3>
                                </div>
                                <div class="comparison-view">
                                    <div class="item-half">
                                        <label>Item You Found</label>
                                        <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
                                        <p class="item-name">${match.foundItemTitle}</p>
                                    </div>
                                    <div class="match-indicator">
                                        <i class="fas fa-arrows-left-right"></i>
                                        <span>${match.matchScore}% Match</span>
                                    </div>
                                    <div class="item-half">
                                        <label>Claimant's Lost Item</label>
                                        <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
                                        <p class="item-name">${match.lostItemTitle}</p>
                                    </div>
                                </div>

                                <!-- ===== මෙන්න අලුතින් එකතු කළ කොටස ===== -->
                                <div class="location-viewer">
                                    <button class="btn-view-location" 
                                            data-lost-lat="${match.lostItemLatitude}" 
                                            data-lost-lng="${match.lostItemLongitude}"
                                            data-found-lat="${match.foundItemLatitude}"
                                            data-found-lng="${match.foundItemLongitude}">
                                        <i class="fas fa-map-marked-alt"></i> View Locations on Map
                                    </button>
                                </div>
                                <!-- ======================================= -->

                                <div class="match-footer">
                                    ${footerHtml}
                                </div>
                            </div>
                        `;


                        // const cardHtml = `
                        //     <div class="match-card">
                        //         <div class="card-header"><h3>Potential match for your '${match.lostItemTitle}'</h3></div>
                        //         <div class="comparison-view">
                        //             <div class="item-half"><label>Your Lost Item</label><img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}"><p class="item-name">${match.lostItemTitle}</p></div>
                        //             <div class="match-indicator"><i class="fas fa-arrows-left-right"></i><span>${match.matchScore}% Match</span></div>
                        //             <div class="item-half"><label>Matched Found Item</label><img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}"><p class="item-name">${match.foundItemTitle}</p></div>
                        //         </div>
                        //         <div class="match-footer">${footerHtml}</div>
                        //     </div>`;
                        $listContainer.append(cardHtml);
                    });
                } else {
                    $listContainer.html('<p class="no-items-message">No matches found for your lost items yet.</p>');
                }
            },
            error: function () { $listContainer.html('<p class="loading-message">Could not load matches.</p>'); }
        });
    }

    // --- Function to Load Matches for FOUND Items ---
    function loadFoundItemMatches() {
        const $listContainer = $('#found-matches-list');
        $listContainer.html('<p class="loading-message">Loading matches for items you found...</p>');
        $.ajax({
            url: 'http://localhost:8080/matching/get_found_matches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            success: function (response) {
                $listContainer.empty();
                if (response.data && response.data.length > 0) {
                    $.each(response.data, function (i, match) {
                        

                        let footerHtml = '';
                        if (match.status === 'REQUEST_SENT') { // This means a request was sent TO YOU
                            footerHtml = `
                            <p class="request-info">Someone has claimed this item.</p>
                            <div class="action-buttons">
                                <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
                                <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
                            </div>`;
                        } else if (match.status === 'PENDING_ACTION') {
                            footerHtml = `<span class="status-badge status-awaiting">Awaiting Claim</span><div class="action-buttons"><p class="awaiting-text">A potential owner can send a request.</p></div>`;
                        } else {
                            footerHtml = `<span class="status-badge">Resolved</span>`;
                        }

                        // const cardHtml = `
                        //     <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
                        //         <div class="card-header"><h3>Potential owner for the '${match.foundItemTitle}' you found</h3></div>
                        //         <div class="comparison-view">
                        //             <div class="item-half"><label>Item You Found</label><img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}"><p class="item-name">${match.foundItemTitle}</p></div>
                        //             <div class="match-indicator"><i class="fas fa-arrows-left-right"></i><span>${match.matchScore}% Match</span></div>
                        //             <div class="item-half"><label>Claimant's Lost Item</label><img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}"><p class="item-name">${match.lostItemTitle}</p></div>
                        //         </div>
                        //         <div class="match-footer">${footerHtml}</div>
                        //     </div>`;

                        const cardHtml = `
                        <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
                            <div class="card-header">
                                <!-- Changed Title -->
                                <h3>Potential owner for the '<strong>${match.foundItemTitle}</strong>' you found</h3>
                            </div>
                            <div class="comparison-view">
                                <div class="item-half">
                                    <!-- Changed Label -->
                                    <label>Item You Found</label> 
                                    <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
                                    <p class="item-name">${match.foundItemTitle}</p>
                                </div>
                                <div class="match-indicator">
                                    <i class="fas fa-arrows-left-right"></i>
                                    <span>${match.matchScore}% Match</span>
                                </div>
                                <div class="item-half">
                                    <!-- Changed Label -->
                                    <label>Claimant's Lost Item</label>
                                    <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
                                    <p class="item-name">${match.lostItemTitle}</p>
                                </div>
                            </div>

                            <!-- "View Location" button is EXACTLY THE SAME -->
                            <div class="location-viewer">
                                <button class="btn-view-location" 
                                        data-lost-lat="${match.lostItemLatitude}" 
                                        data-lost-lng="${match.lostItemLongitude}"
                                        data-found-lat="${match.foundItemLatitude}"
                                        data-found-lng="${match.foundItemLongitude}">
                                    <i class="fas fa-map-marked-alt"></i> View Locations on Map
                                </button>
                            </div>

                            <div class="match-footer">
                                ${footerHtml}
                            </div>
                        </div>
                    `;

                        

                        $listContainer.append(cardHtml);
                    });
                } else {
                    $listContainer.html('<p class="no-items-message">No matches found for your reported items.</p>');
                }
            },
            error: function () { $listContainer.html('<p class="loading-message">Could not load matches.</p>'); }
        });
    }

    // Initial Load
    loadLostItemMatches();
    loadFoundItemMatches();

    
    // =================================================================
    // === CLICK HANDLER FOR "SEND CONTACT REQUEST" BUTTON ===
    // =================================================================
    // We use event delegation for dynamically created buttons
    $('#lost-matches-list').on('click', '.btn-send-request', function() {
        const $thisButton = $(this);
        const matchId = $thisButton.data('match-id');

        // 1. User Confirmation
        if (!confirm('Are you sure you want to send a contact request to the finder?')) {
            return; // Stop if the user clicks "Cancel"
        }

        $thisButton.prop('disabled', true).text('Sending...');

        console.log(matchId);
        

        // 3. The AJAX Call
        $.ajax({
            url: `http://localhost:8080/matching/${matchId}/send_request`,
            method: 'PATCH', // Or 'PATCH' if you prefer
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            
            success: function(response) {
                console.log('Success:', response);
                alert(response.message || 'Contact request sent successfully!');
                
                // 4. Update the UI Dynamically without a page reload
                const $footer = $thisButton.closest('.match-footer');
                
                // Change the status badge
                $footer.find('.status-badge')
                    .removeClass('status-action')
                    .addClass('status-sent')
                    .text('Request Sent');
                
                // Replace the buttons with the "Awaiting response" text
                $footer.find('.action-buttons').html('<p class="awaiting-text">Awaiting response from the finder...</p>');
            },
            
            // This function runs if the request FAILS
            error: function(jqXHR) {
                console.error('Error:', jqXHR.responseText);
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not send the request.";
                alert(`Error: ${errorMessage}`);
                
                // Re-enable the button on error
                $thisButton.prop('disabled', false).text('Send Contact Request');
            }
        });
    });


    // =================================================================
    // === CLICK HANDLER FOR "ACCEPT CONTACT REQUEST" BUTTON ===
    // =================================================================
    // We use event delegation on the FOUND items list container
    $('#found-matches-list').on('click', '.btn-accept-request', function() {

        const $thisButton = $(this);
        const matchId = $thisButton.data('match-id');
        
        // 1. User Feedback: Disable buttons and show loading state
        $thisButton.closest('.action-buttons').find('button').prop('disabled', true);
        $thisButton.text('Accepting...');

        // 2. The AJAX Call
        $.ajax({
            // === ඔබගේ Backend Accept Request API endpoint එක මෙතනට යොදන්න ===
            url: `http://localhost:8080/matching/${matchId}/accept_request`,
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            
            // This function runs if the request is SUCCESSFUL
            success: function(response) {
                console.log('Success:', response);
                alert('Request accepted successfully! The item owner has been notified.');

                // --- UI UPDATE FOR THE FINDER ---
                const $footer = $thisButton.closest('.match-footer');
                const $card = $footer.closest('.match-card');
                
                // Remove highlight and buttons, just show "Resolved"
                $card.removeClass('state-request-received');
                $footer.find('.request-info').remove();
                $footer.find('.action-buttons').html('<span class="status-badge">Resolved</span>');
            },
            
            // This function runs if the request FAILS
            error: function(jqXHR) {
                $thisButton.closest('.action-buttons').find('button').prop('disabled', false);
                $thisButton.text('Accept Request');
            }
        });

    });


    // =================================================================
    // === CLICK HANDLER FOR "VIEW FINDER'S CONTACT" BUTTON ===
    // =================================================================
    // This event listener should be on the LOST items list container
    $('#lost-matches-list').on('click', '.btn-view-contact', function() {
        
        const matchId = $(this).data('match-id');
        const $thisButton = $(this);
        
        // User Feedback
        $thisButton.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Loading...');

        $.ajax({
            // === This is the new API endpoint we created ===
            url: `http://localhost:8080/matching/${matchId}/contact_details`,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            
            success: function(response) {
                if (response && response.data) {
                    const details = response.data;
                    
                    // Display the details in a user-friendly alert or a custom modal
                    alert(
                        `Contact Details for Your Match:\n\n` +
                        `Finder's Name: ${details.fullName}\n` +
                        `Phone Number: ${details.mobile}\n\n` +
                        `Please be respectful when making contact.`
                    );

                } else {
                    alert('Could not retrieve contact details.');
                }
            },
            
            error: function(jqXHR) {
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Failed to get contact details.";
                alert(`Error: ${errorMessage}`);
            },
            
            complete: function() {
                // Re-enable the button
                $thisButton.prop('disabled', false).html('<i class="fas fa-phone-alt"></i> View Finder\'s Contact');
            }
        });
    });


    // =================================================================
    // === CLICK HANDLER FOR "DECLINE CONTACT REQUEST" BUTTON ===
    // =================================================================
    // We use event delegation on the FOUND items list container

    $('#found-matches-list').on('click', '.btn-decline-request', function() {

        const $thisButton = $(this);
        const matchId = $thisButton.data('match-id');
        const $actionButtons = $thisButton.closest('.action-buttons');

        // 1. User Confirmation
        if (!confirm('Are you sure you want to decline this contact request?')) {
            return; // Stop if the user clicks "Cancel"
        }

        // 2. User Feedback: Disable buttons and show loading state
        $actionButtons.find('button').prop('disabled', true);
        $thisButton.text('Declining...');

        // 3. The AJAX Call
        $.ajax({
            // === ඔබගේ Backend Decline Request API endpoint එක මෙතනට යොදන්න ===
            url: `http://localhost:8080/matching/${matchId}/decline_request`,
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            
            // This function runs if the request is SUCCESSFUL
            success: function(response) {
                console.log('Success:', response);
                alert(response.message || 'Request has been successfully declined.');
                
                // 4. Update the UI Dynamically
                const $footer = $thisButton.closest('.match-footer');
                const $card = $footer.closest('.match-card');

                // Remove highlight and buttons, and show a "Resolved" or "Declined" status
                $card.removeClass('state-request-received');
                $footer.find('.request-info').remove(); // Remove the "Someone has claimed..." text
                $actionButtons.html('<span class="status-badge status-declined">DECLINED</span>');
            },
            
            // This function runs if the request FAILS
            error: function(jqXHR) {
                console.error('Error:', jqXHR.responseText);
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not decline the request.";
                alert(`Error: ${errorMessage}`);
                
                // Re-enable buttons on error
                $actionButtons.find('button').prop('disabled', false);
                $thisButton.text('Decline');
            }
        });
    });

});