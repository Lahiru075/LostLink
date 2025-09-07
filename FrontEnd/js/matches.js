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
                console.log(response);
                
                $listContainer.empty();
                if (response.data && response.data.length > 0) {
                    $.each(response.data, function (i, match) {

                        console.log(match);

                        let footerHtml = '';
                        if (match.status === 'PENDING_ACTION') {
                            footerHtml = `<span class="status-badge status-action">Action Needed</span><div class="action-buttons"><a href="#" class="text-link">Not a Match</a><button class="btn-primary" data-match-id="${match.matchId}">Send Contact Request</button></div>`;
                        } else if (match.status === 'REQUEST_SENT') {
                            footerHtml = `<span class="status-badge status-sent">Request Sent</span><div class="action-buttons"><p class="awaiting-text">Awaiting response...</p></div>`;
                        } else {
                            footerHtml = `<span class="status-badge">Resolved</span>`;
                        }



                        const cardHtml = `
                            <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
                                <div class="card-header">
                                    <h3>Potential owner for the '${match.foundItemTitle}' you found</h3>
                                </div>
                                <div class="comparison-view">
                                    <div class="item-half">
                                        <label>Item You Found</label>
                                        <img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
                                        <p class="item-name">${match.foundItemTitle}</p>
                                    </div>
                                    <div class="match-indicator">
                                        <i class="fas fa-arrows-left-right"></i>
                                        <span>${match.matchScore}% Match</span>
                                    </div>
                                    <div class="item-half">
                                        <label>Claimant's Lost Item</label>
                                        <img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
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
                                <button class="btn-secondary" data-match-id="${match.matchId}">Decline</button>
                                <button class="btn-success" data-match-id="${match.matchId}">Accept Request</button>
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
                                    <img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
                                    <p class="item-name">${match.foundItemTitle}</p>
                                </div>
                                <div class="match-indicator">
                                    <i class="fas fa-arrows-left-right"></i>
                                    <span>${match.matchScore}% Match</span>
                                </div>
                                <div class="item-half">
                                    <!-- Changed Label -->
                                    <label>Claimant's Lost Item</label>
                                    <img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
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

    // TODO: Add click handlers for the action buttons (Send Request, Accept, Decline)
    // Example:
    // $('#lost-matches-list').on('click', '.btn-primary', function() {
    //     const matchId = $(this).data('match-id');
    //     // Make a POST request to /api/v1/matches/{matchId}/send-request
    // });
});