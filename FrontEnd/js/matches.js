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
    // function loadLostItemMatches() {
    //     const $listContainer = $('#lost-matches-list');
    //     $listContainer.html('<p class="loading-message">Loading matches for your lost items...</p>');

    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_lost_matches',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         success: function (response) {
                
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function (i, match) {

                    

    //                     let footerHtml = '';
    //                     if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-action">Action Needed</span>
    //                             <div class="action-buttons">
    //                                 <button class="text-link btn-decline-match" data-match-id="${match.matchId}">Not a Match</button>
    //                                 <button class="btn-primary btn-send-request" data-match-id="${match.matchId}">Send Contact Request</button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'REQUEST_SENT') {
    //                         footerHtml = `
    //                             <span class="status-badge status-sent">Request Sent</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">Awaiting finder's response...</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT ACCEPTED</span>
    //                             <div class="action-buttons">
    //                                 <button class="btn-primary btn-view-contact" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-phone-alt"></i> View Contact
    //                                 </button>
    //                                 <button class="btn-success btn-mark-recovered" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-check-circle"></i> Mark as Recovered
    //                                 </button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'DECLINED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-declined">DECLINED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">The finder declined your request.</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'RECOVERED') {
    //                         // === THIS IS THE NEW PART FOR THE FINAL STATUS ===
    //                         footerHtml = `
    //                             <span class="status-badge status-recovered">RECOVERED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text"><i class="fas fa-check-circle"></i> Transaction Completed!</p>
    //                             </div>
    //                         `;
    //                     } else {
    //                         // Fallback for any other status
    //                         footerHtml = `<span class="status-badge">${match.status}</span>`;
    //                     }



    //                     const cardHtml = `
    //                         <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
    //                             <div class="card-header">
    //                                 <h3>Potential owner for the '${match.foundItemTitle}' you found</h3>
    //                             </div>
    //                             <div class="comparison-view">
    //                                 <div class="item-half">
    //                                     <label>Item You Found</label>
    //                                     <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                     <p class="item-name">${match.foundItemTitle}</p>
    //                                 </div>
    //                                 <div class="match-indicator">
    //                                     <i class="fas fa-arrows-left-right"></i>
    //                                     <span>${match.matchScore}% Match</span>
    //                                 </div>
    //                                 <div class="item-half">
    //                                     <label>Claimant's Lost Item</label>
    //                                     <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                     <p class="item-name">${match.lostItemTitle}</p>
    //                                 </div>
    //                             </div>

    //                             <!-- ===== මෙන්න අලුතින් එකතු කළ කොටස ===== -->
    //                             <div class="location-viewer">
    //                                 <button class="btn-view-location" 
    //                                         data-lost-lat="${match.lostItemLatitude}" 
    //                                         data-lost-lng="${match.lostItemLongitude}"
    //                                         data-found-lat="${match.foundItemLatitude}"
    //                                         data-found-lng="${match.foundItemLongitude}">
    //                                     <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                                 </button>
    //                             </div>
    //                             <!-- ======================================= -->

    //                             <div class="match-footer">
    //                                 ${footerHtml}
    //                             </div>
    //                         </div>
    //                     `;


    //                     // const cardHtml = `
    //                     //     <div class="match-card">
    //                     //         <div class="card-header"><h3>Potential match for your '${match.lostItemTitle}'</h3></div>
    //                     //         <div class="comparison-view">
    //                     //             <div class="item-half"><label>Your Lost Item</label><img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}"><p class="item-name">${match.lostItemTitle}</p></div>
    //                     //             <div class="match-indicator"><i class="fas fa-arrows-left-right"></i><span>${match.matchScore}% Match</span></div>
    //                     //             <div class="item-half"><label>Matched Found Item</label><img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}"><p class="item-name">${match.foundItemTitle}</p></div>
    //                     //         </div>
    //                     //         <div class="match-footer">${footerHtml}</div>
    //                     //     </div>`;
    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for your lost items yet.</p>');
    //             }
    //         },
    //         error: function () { $listContainer.html('<p class="loading-message">Could not load matches.</p>'); }
    //     });
    // }

    // --- Function to Load Matches for FOUND Items ---
    // function loadFoundItemMatches() {
    //     const $listContainer = $('#found-matches-list');
    //     $listContainer.html('<p class="loading-message">Loading matches for items you found...</p>');
    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_found_matches',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         success: function (response) {
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function (i, match) {
                        

    //                     let footerHtml = '';

    //                     if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-awaiting">AWAITING CLAIM</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">The potential owner can send a request.</p>
    //                             </div>
    //                         `;
    //                     } 
    //                     // This status means a contact request has been sent TO YOU (the Finder).
    //                     else if (match.status === 'REQUEST_SENT') { 
    //                         footerHtml = `
    //                             <p class="request-info"><strong>Action Required:</strong> A user has claimed this item.</p>
    //                             <div class="action-buttons">
    //                                 <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
    //                                 <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
    //                             </div>
    //                         `;
    //                     } 
    //                     // This status means YOU have accepted the request.
    //                     else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT SHARED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">You have shared your contact. Waiting for the owner to mark as recovered.</p>
    //                             </div>
    //                         `;
    //                     } 
    //                     // This status means YOU declined the request.
    //                     else if (match.status === 'DECLINED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-declined">YOU DECLINED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">You have declined this request.</p>
    //                             </div>
    //                         `;
    //                     } 
    //                     // This status means the transaction is successfully completed.
    //                     else if (match.status === 'RECOVERED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-recovered">RETURNED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text"><i class="fas fa-check-circle"></i> Transaction Completed!</p>
    //                             </div>
    //                         `;
    //                     } 
    //                     // Fallback for any other status
    //                     else {
    //                         footerHtml = `<span class="status-badge">${match.status}</span>`;
    //                     }

    //                     // if (match.status === 'REQUEST_SENT') { // This means a request was sent TO YOU
    //                     //     footerHtml = `
    //                     //     <p class="request-info">Someone has claimed this item.</p>
    //                     //     <div class="action-buttons">
    //                     //         <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
    //                     //         <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
    //                     //     </div>`;
    //                     // } else if (match.status === 'PENDING_ACTION') {
    //                     //     footerHtml = `<span class="status-badge status-awaiting">Awaiting Claim</span><div class="action-buttons"><p class="awaiting-text">A potential owner can send a request.</p></div>`;
    //                     // } else {
    //                     //     footerHtml = `<span class="status-badge">Resolved</span>`;
    //                     // }

    //                     // const cardHtml = `
    //                     //     <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
    //                     //         <div class="card-header"><h3>Potential owner for the '${match.foundItemTitle}' you found</h3></div>
    //                     //         <div class="comparison-view">
    //                     //             <div class="item-half"><label>Item You Found</label><img src="http://localhost:8080/uploads/${match.foundItemImageUrl}" alt="${match.foundItemTitle}"><p class="item-name">${match.foundItemTitle}</p></div>
    //                     //             <div class="match-indicator"><i class="fas fa-arrows-left-right"></i><span>${match.matchScore}% Match</span></div>
    //                     //             <div class="item-half"><label>Claimant's Lost Item</label><img src="http://localhost:8080/uploads/${match.lostItemImageUrl}" alt="${match.lostItemTitle}"><p class="item-name">${match.lostItemTitle}</p></div>
    //                     //         </div>
    //                     //         <div class="match-footer">${footerHtml}</div>
    //                     //     </div>`;

    //                     const cardHtml = `
    //                     <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
    //                         <div class="card-header">
    //                             <!-- Changed Title -->
    //                             <h3>Potential owner for the '<strong>${match.foundItemTitle}</strong>' you found</h3>
    //                         </div>
    //                         <div class="comparison-view">
    //                             <div class="item-half">
    //                                 <!-- Changed Label -->
    //                                 <label>Item You Found</label> 
    //                                 <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                 <p class="item-name">${match.foundItemTitle}</p>
    //                             </div>
    //                             <div class="match-indicator">
    //                                 <i class="fas fa-arrows-left-right"></i>
    //                                 <span>${match.matchScore}% Match</span>
    //                             </div>
    //                             <div class="item-half">
    //                                 <!-- Changed Label -->
    //                                 <label>Claimant's Lost Item</label>
    //                                 <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                 <p class="item-name">${match.lostItemTitle}</p>
    //                             </div>
    //                         </div>

    //                         <!-- "View Location" button is EXACTLY THE SAME -->
    //                         <div class="location-viewer">
    //                             <button class="btn-view-location" 
    //                                     data-lost-lat="${match.lostItemLatitude}" 
    //                                     data-lost-lng="${match.lostItemLongitude}"
    //                                     data-found-lat="${match.foundItemLatitude}"
    //                                     data-found-lng="${match.foundItemLongitude}">
    //                                 <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                             </button>
    //                         </div>

    //                         <div class="match-footer">
    //                             ${footerHtml}
    //                         </div>
    //                     </div>
    //                 `;

                        

    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for your reported items.</p>');
    //             }
    //         },
    //         error: function () { $listContainer.html('<p class="loading-message">Could not load matches.</p>'); }
    //     });
    // }

    // Initial Load
    // loadLostItemMatches();
    // loadFoundItemMatches();

    
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

                Swal.fire({
                    text: response.message || 'Contact request sent successfully!',
                    title: "Success!",
                    icon: "success",
                    draggable: true
                })

                
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

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Error: ${errorMessage}`,
                });
                
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
                

                Swal.fire({
                    text: 'Request accepted successfully! The item owner has been notified..!',
                    title: "Success!",
                    icon: "success",
                    draggable: true
                })


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
                    
                    Swal.fire({
                        title: "Success!",
                        icon: "success",
                        html: `Contact Details for Your Match:<br><br>
                                Finder's Name: ${details.fullName}<br>
                                Phone Number: ${details.mobile}<br><br>
                                Please be respectful when making contact.`,
                        draggable: true
                    });
                    

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: 'Could not retrieve contact details.',
                    });
                }
            },
            
            error: function(jqXHR) {
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Failed to get contact details.";

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Error: ${errorMessage}`,
                });

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

                Swal.fire({
                    text: response.message || 'Request has been successfully declined.',
                    title: "Success!",
                    icon: "success",
                    draggable: true
                })
                
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
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not decline the request.";

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Error: ${errorMessage}`,
                });

                
                // Re-enable buttons on error
                $actionButtons.find('button').prop('disabled', false);
                $thisButton.text('Decline');
            }
        });
    });



    // =================================================================
    // === CLICK HANDLER FOR "MARK AS RECOVERED" BUTTON ===
    // =================================================================
    // This can be triggered from BOTH the Lost Item and Found Item tabs
    // So, we attach the listener to the parent container of both lists.
    $('.main-content').on('click', '.btn-mark-recovered', function() {

        const $thisButton = $(this);
        const matchId = $thisButton.data('match-id');
        
        // 1. User Confirmation
        if (!confirm('Have you successfully recovered/returned the item? This will close the transaction.')) {
            return; // Stop if the user clicks "Cancel"
        }

        // 2. User Feedback: Disable the button and show a loading state
        $thisButton.prop('disabled', true).text('Marking...');
        
        // 3. The AJAX Call
        $.ajax({
            // === ඔබගේ Backend Mark as Recovered API endpoint එක මෙතනට යොදන්න ===
            url: `http://localhost:8080/matching/${matchId}/mark-as-recovered`,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            
            // This function runs if the request is SUCCESSFUL
            success: function(response) {
                
                Swal.fire({
                    text: response.message || 'Transaction successfully marked as recovered!',
                    title: "Success!",
                    icon: "success",
                    draggable: true
                })
               
                loadLostItemMatches();
                loadFoundItemMatches();
            },
            
            // This function runs if the request FAILS
            error: function(jqXHR) {

                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Could not complete this action.";

                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `Error: ${errorMessage}`,
                });
                
                // Re-enable the button on error
                $thisButton.prop('disabled', false).text('Mark as Recovered');
            }
        });
    });







    // function loadLostItemMatches() {
    //     const $listContainer = $('#lost-matches-list');
    //     // Get the currently active filter status for this tab
    //     const statusToFilter = $('#lost-item-filter-tabs .filter-tab-btn.active').data('status');
        
    //     $listContainer.html('<p class="loading-message">Loading matches...</p>');

    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_lost_matches',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: {
    //             status: statusToFilter // Send the selected status to the backend
    //         },
    //         success: function(response) {
    //             // The rest of this success function is EXACTLY THE SAME as your
    //             // original loadLostItemMatches function. You can create a reusable
    //             // function to render the cards to avoid repeating code.
                
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function(i, match) {
    //                     // ... (your existing, complete card building logic)
                        
    //                     let footerHtml = '';
    //                     if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-action">Action Needed</span>
    //                             <div class="action-buttons">
    //                                 <button class="text-link btn-decline-match" data-match-id="${match.matchId}">Not a Match</button>
    //                                 <button class="btn-primary btn-send-request" data-match-id="${match.matchId}">Send Contact Request</button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'REQUEST_SENT') {
    //                         footerHtml = `
    //                             <span class="status-badge status-sent">Request Sent</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">Awaiting finder's response...</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT ACCEPTED</span>
    //                             <div class="action-buttons">
    //                                 <button class="btn-primary btn-view-contact" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-phone-alt"></i> View Contact
    //                                 </button>
    //                                 <button class="btn-success btn-mark-recovered" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-check-circle"></i> Mark as Recovered
    //                                 </button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'DECLINED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-declined">DECLINED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">The finder declined your request.</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'RECOVERED') {
    //                         // === THIS IS THE NEW PART FOR THE FINAL STATUS ===
    //                         footerHtml = `
    //                             <span class="status-badge status-recovered">RECOVERED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text"><i class="fas fa-check-circle"></i> Transaction Completed!</p>
    //                             </div>
    //                         `;
    //                     } else {
    //                         // Fallback for any other status
    //                         footerHtml = `<span class="status-badge">${match.status}</span>`;
    //                     }



    //                     const cardHtml = `
    //                         <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
    //                             <div class="card-header">
    //                                 <h3>Potential owner for the '${match.foundItemTitle}' you found</h3>
    //                             </div>
    //                             <div class="comparison-view">
    //                                 <div class="item-half">
    //                                     <label>Item You Found</label>
    //                                     <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                     <p class="item-name">${match.foundItemTitle}</p>
    //                                 </div>
    //                                 <div class="match-indicator">
    //                                     <i class="fas fa-arrows-left-right"></i>
    //                                     <span>${match.matchScore}% Match</span>
    //                                 </div>
    //                                 <div class="item-half">
    //                                     <label>Claimant's Lost Item</label>
    //                                     <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                     <p class="item-name">${match.lostItemTitle}</p>
    //                                 </div>
    //                             </div>

    //                             <!-- ===== මෙන්න අලුතින් එකතු කළ කොටස ===== -->
    //                             <div class="location-viewer">
    //                                 <button class="btn-view-location" 
    //                                         data-lost-lat="${match.lostItemLatitude}" 
    //                                         data-lost-lng="${match.lostItemLongitude}"
    //                                         data-found-lat="${match.foundItemLatitude}"
    //                                         data-found-lng="${match.foundItemLongitude}">
    //                                     <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                                 </button>
    //                             </div>
    //                             <!-- ======================================= -->

    //                             <div class="match-footer">
    //                                 ${footerHtml}
    //                             </div>
    //                         </div>
    //                     `;


    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for this filter.</p>');
    //             }
    //         },
    //         error: function() {
    //             $listContainer.html('<p class="loading-message">Could not load matches.</p>');
    //         }
    //     });
    // }






    function renderPagination(totalPages, currentPage, $container, pageType) {
        $container.empty();
        if (totalPages <= 1) return;

        // We no longer need the <ul> wrapper
        
        // Previous Button
        let prevHtml = `<a href="#" class="page-link ${currentPage === 0 ? 'disabled' : ''}" data-page="${currentPage - 1}" data-type="${pageType}">Previous</a>`;
        $container.append(prevHtml);

        // Page Number Buttons
        for (let i = 0; i < totalPages; i++) {
            let pageHtml = `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}" data-type="${pageType}">${i + 1}</a>`;
            $container.append(pageHtml);
        }

        // Next Button
        let nextHtml = `<a href="#" class="page-link ${currentPage >= totalPages - 1 ? 'disabled' : ''}" data-page="${currentPage + 1}" data-type="${pageType}">Next</a>`;
        $container.append(nextHtml);
    }

    // --- Main function to load LOST item matches ---
    function loadLostItemMatches(page = 0) {
        const $listContainer = $('#lost-matches-list');
        const status = $('#lost-item-filter-tabs .active').data('status');
        $listContainer.html('<p class="loading-message">Loading matches...</p>');

        $.ajax({
            url: 'http://localhost:8080/matching/get_lost_matches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            data: { status: status, page: page, size: 2 },
            success: function(response) {
                $listContainer.empty();
                const pageData = response.data;
                if (pageData && pageData.content && pageData.content.length > 0) {
                    $.each(pageData.content, function(i, match) {

                        let footerHtml = '';
                        if (match.status === 'PENDING_ACTION') {
                            footerHtml = `
                                <span class="status-badge status-action">Action Needed</span>
                                <div class="action-buttons">
                                    <button class="btn-primary btn-send-request" data-match-id="${match.matchId}">Send Contact Request</button>
                                </div>
                            `;
                        } else if (match.status === 'REQUEST_SENT') {
                            footerHtml = `
                                <span class="status-badge status-sent">Request Sent</span>
                                <div class="action-buttons">
                                    <p class="awaiting-text">Awaiting finder's response...</p>
                                </div>
                            `;
                        } else if (match.status === 'ACCEPTED') {
                            footerHtml = `
                                <span class="status-badge status-accepted">CONTACT ACCEPTED</span>
                                <div class="action-buttons">
                                    <button class="btn-primary btn-view-contact" data-match-id="${match.matchId}">
                                        <i class="fas fa-phone-alt"></i> View Contact
                                    </button>
                                    <button class="btn-success btn-mark-recovered" data-match-id="${match.matchId}">
                                        <i class="fas fa-check-circle"></i> Mark as Recovered
                                    </button>
                                </div>
                            `;
                        } else if (match.status === 'DECLINED') {
                            footerHtml = `
                                <span class="status-badge status-declined">DECLINED</span>
                                <div class="action-buttons">
                                    <p class="status-text">The finder declined your request.</p>
                                </div>
                            `;
                        } else if (match.status === 'RECOVERED') {
                            // === THIS IS THE NEW PART FOR THE FINAL STATUS ===
                            footerHtml = `
                                <span class="status-badge status-recovered">RECOVERED</span>
                                <div class="action-buttons">
                                    <p class="status-text"><i class="fas fa-check-circle"></i> Transaction Completed!</p>
                                </div>
                            `;
                        } else {
                            // Fallback for any other status
                            footerHtml = `<span class="status-badge">${match.status}</span>`;
                        }



                        const cardHtml = `
                            <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
                                <div class="card-header">
                                    <h3>Potential owner for the  '<strong>${match.foundItemTitle}</strong>' you found</h3>
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


                        $listContainer.append(cardHtml);
                    });
                    renderPagination(pageData.totalPages, pageData.number, $('#lost-pagination-container'), 'lost');
                } else {
                    $listContainer.html('<p class="no-items-message">No matches found.</p>');
                    $('#lost-pagination-container').empty();
                }
            }
        });
    }

    // --- Main function to load FOUND item matches ---
    function loadFoundItemMatches(page = 0) {
        const $listContainer = $('#found-matches-list');
        const status = $('#found-item-filter-tabs .active').data('status');
        $listContainer.html('<p class="loading-message">Loading matches...</p>');

        $.ajax({
            url: 'http://localhost:8080/matching/get_found_matches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + authToken },
            data: { status: status, page: page, size: 2 },
            success: function(response) {
                $listContainer.empty();
                const pageData = response.data;
                if (pageData && pageData.content && pageData.content.length > 0) {
                    $.each(pageData.content, function(i, match) {
                        
                        let footerHtml = '';
                        if (match.status === 'REQUEST_SENT') { // A request was sent TO YOU
                            footerHtml = `
                                <p class="request-info"><strong>Action Required:</strong> A user has claimed this item.</p>
                                <div class="action-buttons">
                                    <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
                                    <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
                                </div>`;
                        } else if (match.status === 'PENDING_ACTION') {
                            footerHtml = `
                                <span class="status-badge status-awaiting">AWAITING CLAIM</span>
                                <div class="action-buttons">
                                    <p class="awaiting-text">A potential owner can send a request.</p>
                                </div>`;
                        } else if (match.status === 'ACCEPTED') {
                            footerHtml = `
                                <span class="status-badge status-accepted">CONTACT SHARED</span>
                                <div class="action-buttons">
                                    <p class="status-text">You shared your contact. Waiting for recovery confirmation.</p>
                                </div>`;
                        } else { // DECLINED or RECOVERED
                            footerHtml = `<span class="status-badge status-resolved">${match.status.replace('_', ' ')}</span>`;
                        }

                        // --- The card structure is the same, but the labels and title are different ---
                        const cardHtml = `
                            <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}" data-match-id="${match.matchId}">
                                <div class="card-header">
                                    <h3>Potential owner for the '<strong>${match.foundItemTitle}</strong>' you found</h3>
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
                    renderPagination(pageData.totalPages, pageData.number, $('#found-pagination-container'), 'found');
                } else {
                    $listContainer.html('<p class="no-items-message">No matches found.</p>');
                    $('#found-pagination-container').empty();
                }
            }
        });
    }
    
    // --- Event Listeners ---
    $('#lost-item-filter-tabs').on('click', '.filter-tab-btn', function() {
        $('#lost-item-filter-tabs .filter-tab-btn').removeClass('active');
        $(this).addClass('active');
        loadLostItemMatches(0); // Load first page of new filter
    });

    $('#found-item-filter-tabs').on('click', '.filter-tab-btn', function() {
        $('#found-item-filter-tabs .filter-tab-btn').removeClass('active');
        $(this).addClass('active');
        loadFoundItemMatches(0);
    });

    // --- Single Pagination Click Handler for BOTH lists ---
    $('.main-content').on('click', '.pagination-container .page-link', function(e) {
        e.preventDefault();
        const $this = $(this);
        if ($this.hasClass('disabled') || $this.hasClass('active')) return;
        
        const pageToLoad = $this.data('page');
        const pageType = $this.data('type'); // 'lost' or 'found'

        if (pageType === 'lost') {
            loadLostItemMatches(pageToLoad);
        } else if (pageType === 'found') {
            loadFoundItemMatches(pageToLoad);
        }
    });

    // ... (Your other click handlers for buttons inside cards)

    // --- Initial Load ---
    loadLostItemMatches(0);
    loadFoundItemMatches(0);


    $('#logoutBtn').on('click', function(event) {
        event.preventDefault();
        localStorage.removeItem('authToken');
        alert("You have been logged out successfully.");
        window.location.href = 'loginpage.html'; 
    });





    // function loadFoundItemMatches() {
    //     const $listContainer = $('#found-matches-list');
    //     // Get the currently active filter status for this tab
    //     const statusToFilter = $('#found-item-filter-tabs .filter-tab-btn.active').data('status');

    //     $listContainer.html('<p class="loading-message">Loading matches...</p>');

    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_found_matches', // <-- IMPORTANT: The URL is different
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: {
    //             status: statusToFilter
    //         },
    //         success: function(response) {
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function(i, match) {
                        
    //                     // --- This is the footer logic specific to the FINDER's perspective ---
    //                     let footerHtml = '';
    //                     if (match.status === 'REQUEST_SENT') { // A request was sent TO YOU
    //                         footerHtml = `
    //                             <p class="request-info"><strong>Action Required:</strong> A user has claimed this item.</p>
    //                             <div class="action-buttons">
    //                                 <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
    //                                 <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
    //                             </div>`;
    //                     } else if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-awaiting">AWAITING CLAIM</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">A potential owner can send a request.</p>
    //                             </div>`;
    //                     } else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT SHARED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">You shared your contact. Waiting for recovery confirmation.</p>
    //                             </div>`;
    //                     } else { // DECLINED or RECOVERED
    //                         footerHtml = `<span class="status-badge status-resolved">${match.status.replace('_', ' ')}</span>`;
    //                     }

    //                     // --- The card structure is the same, but the labels and title are different ---
    //                     const cardHtml = `
    //                         <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}" data-match-id="${match.matchId}">
    //                             <div class="card-header">
    //                                 <h3>Potential owner for the '<strong>${match.foundItemTitle}</strong>' you found</h3>
    //                             </div>
    //                             <div class="comparison-view">
    //                                 <div class="item-half">
    //                                     <label>Item You Found</label>
    //                                     <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                     <p class="item-name">${match.foundItemTitle}</p>
    //                                 </div>
    //                                 <div class="match-indicator">
    //                                     <i class="fas fa-arrows-left-right"></i>
    //                                     <span>${match.matchScore}% Match</span>
    //                                 </div>
    //                                 <div class="item-half">
    //                                     <label>Claimant's Lost Item</label>
    //                                     <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                     <p class="item-name">${match.lostItemTitle}</p>
    //                                 </div>
    //                             </div>
    //                             <div class="location-viewer">
    //                                 <button class="btn-view-location" 
    //                                         data-lost-lat="${match.lostItemLatitude}" 
    //                                         data-lost-lng="${match.lostItemLongitude}"
    //                                         data-found-lat="${match.foundItemLatitude}"
    //                                         data-found-lng="${match.foundItemLongitude}">
    //                                     <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                                 </button>
    //                             </div>
    //                             <div class="match-footer">
    //                                 ${footerHtml}
    //                             </div>
    //                         </div>
    //                     `;
    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for items you have reported.</p>');
    //             }
    //         },
    //         error: function() {
    //             $listContainer.html('<p class="loading-message">Could not load matches.</p>');
    //         }
    //     });
    // }



    // $('#lost-item-filter-tabs').on('click', '.filter-tab-btn', function() {
    //     $('#lost-item-filter-tabs .filter-tab-btn').removeClass('active');
    //     $(this).addClass('active');
    //     loadLostItemMatches(); // Just call the main loader function
    // });

    // $('#found-item-filter-tabs').on('click', '.filter-tab-btn', function() {
    //     $('#found-item-filter-tabs .filter-tab-btn').removeClass('active');
    //     $(this).addClass('active');
    //     loadFoundItemMatches(); // Just call the main loader function
    // });

    // loadLostItemMatches();
    // loadFoundItemMatches();







    // // =================================================================
    // // === CLICK HANDLER FOR LOST ITEM FILTER TABS ===
    // // =================================================================
    // $('#lost-item-filter-tabs').on('click', '.filter-tab-btn', function () {
        
    //     const $thisButton = $(this);
        
    //     // 1. Update the active state for the UI
    //     $('#lost-item-filter-tabs .filter-tab-btn').removeClass('active');
    //     $thisButton.addClass('active');
        
    //     // 2. Get the status to filter by from the button's data attribute
    //     const statusToFilter = $thisButton.data('status');
        
    //     // 3. Get the container for the list
    //     const $listContainer = $('#lost-matches-list');
    //     $listContainer.html('<p class="loading-message">Filtering matches...</p>');

        
        

    //     // 4. Make the AJAX call with the new 'status' parameter
    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_lost_matches',
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: {
    //             status: statusToFilter // Send the selected status to the backend
    //         },
    //         success: function(response) {
    //             // The rest of this success function is EXACTLY THE SAME as your
    //             // original loadLostItemMatches function. You can create a reusable
    //             // function to render the cards to avoid repeating code.
                
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function(i, match) {
    //                     // ... (your existing, complete card building logic)
                        
    //                     let footerHtml = '';
    //                     if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-action">Action Needed</span>
    //                             <div class="action-buttons">
    //                                 <button class="text-link btn-decline-match" data-match-id="${match.matchId}">Not a Match</button>
    //                                 <button class="btn-primary btn-send-request" data-match-id="${match.matchId}">Send Contact Request</button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'REQUEST_SENT') {
    //                         footerHtml = `
    //                             <span class="status-badge status-sent">Request Sent</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">Awaiting finder's response...</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT ACCEPTED</span>
    //                             <div class="action-buttons">
    //                                 <button class="btn-primary btn-view-contact" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-phone-alt"></i> View Contact
    //                                 </button>
    //                                 <button class="btn-success btn-mark-recovered" data-match-id="${match.matchId}">
    //                                     <i class="fas fa-check-circle"></i> Mark as Recovered
    //                                 </button>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'DECLINED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-declined">DECLINED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">The finder declined your request.</p>
    //                             </div>
    //                         `;
    //                     } else if (match.status === 'RECOVERED') {
    //                         // === THIS IS THE NEW PART FOR THE FINAL STATUS ===
    //                         footerHtml = `
    //                             <span class="status-badge status-recovered">RECOVERED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text"><i class="fas fa-check-circle"></i> Transaction Completed!</p>
    //                             </div>
    //                         `;
    //                     } else {
    //                         // Fallback for any other status
    //                         footerHtml = `<span class="status-badge">${match.status}</span>`;
    //                     }



    //                     const cardHtml = `
    //                         <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}">
    //                             <div class="card-header">
    //                                 <h3>Potential owner for the '${match.foundItemTitle}' you found</h3>
    //                             </div>
    //                             <div class="comparison-view">
    //                                 <div class="item-half">
    //                                     <label>Item You Found</label>
    //                                     <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                     <p class="item-name">${match.foundItemTitle}</p>
    //                                 </div>
    //                                 <div class="match-indicator">
    //                                     <i class="fas fa-arrows-left-right"></i>
    //                                     <span>${match.matchScore}% Match</span>
    //                                 </div>
    //                                 <div class="item-half">
    //                                     <label>Claimant's Lost Item</label>
    //                                     <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                     <p class="item-name">${match.lostItemTitle}</p>
    //                                 </div>
    //                             </div>

    //                             <!-- ===== මෙන්න අලුතින් එකතු කළ කොටස ===== -->
    //                             <div class="location-viewer">
    //                                 <button class="btn-view-location" 
    //                                         data-lost-lat="${match.lostItemLatitude}" 
    //                                         data-lost-lng="${match.lostItemLongitude}"
    //                                         data-found-lat="${match.foundItemLatitude}"
    //                                         data-found-lng="${match.foundItemLongitude}">
    //                                     <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                                 </button>
    //                             </div>
    //                             <!-- ======================================= -->

    //                             <div class="match-footer">
    //                                 ${footerHtml}
    //                             </div>
    //                         </div>
    //                     `;


    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for this filter.</p>');
    //             }
    //         },
    //         error: function() {
    //             $listContainer.html('<p class="loading-message">Could not load matches.</p>');
    //         }
    //     });
    // });


    // =================================================================
    // === CLICK HANDLER FOR "FOUND ITEM" FILTER TABS ===
    // =================================================================
    // $('#found-item-filter-tabs').on('click', '.filter-tab-btn', function () {
        
    //     const $thisButton = $(this);
        
    //     // 1. Update the active state for the UI
    //     $('#found-item-filter-tabs .filter-tab-btn').removeClass('active');
    //     $thisButton.addClass('active');
        
    //     // 2. Get the status to filter by
    //     const statusToFilter = $thisButton.data('status');
        
    //     // 3. Get the container for the list
    //     const $listContainer = $('#found-matches-list');
    //     $listContainer.html('<p class="loading-message">Filtering matches...</p>');

    //     // 4. Make the AJAX call with the new 'status' parameter
    //     $.ajax({
    //         url: 'http://localhost:8080/matching/get_found_matches', // <-- IMPORTANT: The URL is different
    //         method: 'GET',
    //         headers: { 'Authorization': 'Bearer ' + authToken },
    //         data: {
    //             status: statusToFilter
    //         },
    //         success: function(response) {
    //             $listContainer.empty();
    //             if (response.data && response.data.length > 0) {
    //                 $.each(response.data, function(i, match) {
                        
    //                     // --- This is the footer logic specific to the FINDER's perspective ---
    //                     let footerHtml = '';
    //                     if (match.status === 'REQUEST_SENT') { // A request was sent TO YOU
    //                         footerHtml = `
    //                             <p class="request-info"><strong>Action Required:</strong> A user has claimed this item.</p>
    //                             <div class="action-buttons">
    //                                 <button class="btn-secondary btn-decline-request" data-match-id="${match.matchId}">Decline</button>
    //                                 <button class="btn-success btn-accept-request" data-match-id="${match.matchId}">Accept Request</button>
    //                             </div>`;
    //                     } else if (match.status === 'PENDING_ACTION') {
    //                         footerHtml = `
    //                             <span class="status-badge status-awaiting">AWAITING CLAIM</span>
    //                             <div class="action-buttons">
    //                                 <p class="awaiting-text">A potential owner can send a request.</p>
    //                             </div>`;
    //                     } else if (match.status === 'ACCEPTED') {
    //                         footerHtml = `
    //                             <span class="status-badge status-accepted">CONTACT SHARED</span>
    //                             <div class="action-buttons">
    //                                 <p class="status-text">You shared your contact. Waiting for recovery confirmation.</p>
    //                             </div>`;
    //                     } else { // DECLINED or RECOVERED
    //                         footerHtml = `<span class="status-badge status-resolved">${match.status.replace('_', ' ')}</span>`;
    //                     }

    //                     // --- The card structure is the same, but the labels and title are different ---
    //                     const cardHtml = `
    //                         <div class="match-card ${match.status === 'REQUEST_SENT' ? 'state-request-received' : ''}" data-match-id="${match.matchId}">
    //                             <div class="card-header">
    //                                 <h3>Potential owner for the '<strong>${match.foundItemTitle}</strong>' you found</h3>
    //                             </div>
    //                             <div class="comparison-view">
    //                                 <div class="item-half">
    //                                     <label>Item You Found</label>
    //                                     <img src="${match.foundItemImageUrl}" alt="${match.foundItemTitle}">
    //                                     <p class="item-name">${match.foundItemTitle}</p>
    //                                 </div>
    //                                 <div class="match-indicator">
    //                                     <i class="fas fa-arrows-left-right"></i>
    //                                     <span>${match.matchScore}% Match</span>
    //                                 </div>
    //                                 <div class="item-half">
    //                                     <label>Claimant's Lost Item</label>
    //                                     <img src="${match.lostItemImageUrl}" alt="${match.lostItemTitle}">
    //                                     <p class="item-name">${match.lostItemTitle}</p>
    //                                 </div>
    //                             </div>
    //                             <div class="location-viewer">
    //                                 <button class="btn-view-location" 
    //                                         data-lost-lat="${match.lostItemLatitude}" 
    //                                         data-lost-lng="${match.lostItemLongitude}"
    //                                         data-found-lat="${match.foundItemLatitude}"
    //                                         data-found-lng="${match.foundItemLongitude}">
    //                                     <i class="fas fa-map-marked-alt"></i> View Locations on Map
    //                                 </button>
    //                             </div>
    //                             <div class="match-footer">
    //                                 ${footerHtml}
    //                             </div>
    //                         </div>
    //                     `;
    //                     $listContainer.append(cardHtml);
    //                 });
    //             } else {
    //                 $listContainer.html('<p class="no-items-message">No matches found for items you have reported.</p>');
    //             }
    //         },
    //         error: function() {
    //             $listContainer.html('<p class="loading-message">Could not load matches.</p>');
    //         }
    //     });
    // });

    //  $('#lost-item-filter-tabs .filter-tab-btn[data-status="ALL"]').click();

    // // Find the default "All" button in the "Found Items" tab and click it.
    // // This will also trigger its click handler.
    // $('#found-item-filter-tabs .filter-tab-btn[data-status="ALL"]').click();

});