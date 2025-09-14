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
    // ===     CONTACT REQUESTS MANAGEMENT SCRIPT    ===
    // ===============================================

    // --- Selectors ---
    const searchInput = $('#requestSearch');
    const statusFilter = $('#status-filter');
    const tableBody = $('#requestsTableBody');
    const paginationContainer = $('#paginationContainer');
    const totalCountEl = $('#totalPendingCount'); // Note: This might need a different endpoint if it only shows "Pending"
    const suggestionsPanel = $('#suggestionsPanel'); // Assuming you add this div in HTML

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

    // --- Main Function to Load Contact Requests ---
    function loadContactRequests(page = 0) {
        currentPage = page;
        const searchKeyword = searchInput.val().trim();
        const status = statusFilter.val();

        const filterData = {
            page: currentPage,
            size: pageSize
        };
        if (searchKeyword) filterData.search = searchKeyword;
        if (status && status !== 'all') filterData.status = status;

        tableBody.html('<tr><td colspan="6" class="text-center">Loading requests...</td></tr>');

        $.ajax({
            url: 'http://localhost:8080/request_manage/contact_requests',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            success: function(response) {
                tableBody.empty();

                const pageData = response.data;
                const requestList = pageData.content;
                totalPages = pageData.totalPages;

                if (requestList.length === 0) {
                    tableBody.append('<tr><td colspan="6" class="text-center">No contact requests found.</td></tr>');
                } else {
                    requestList.forEach(request => {
                        const statusClass = request.matchStatus ? request.matchStatus.toLowerCase() : 'unknown';
                        const dateRequested = new Date(request.matchDate).toLocaleDateString('en-CA');

                        const requestRowHtml = `
                            <tr>
                                <td>
                                    <div class="request-details-cell">
                                        <img src="${request.lostItemImageUrl || 'https://via.placeholder.com/40'}" class="item-thumbnail">
                                        <i class="fas fa-exchange-alt"></i>
                                        <img src="${request.foundItemImageUrl || 'https://via.placeholder.com/40'}" class="item-thumbnail">
                                    </div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${request.loserImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic">
                                        <span class="user-name">${request.loserFullName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${request.finderImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic">
                                        <span class="user-name">${request.finderFullName}</span>
                                    </div>
                                </td>
                                <td>${dateRequested}</td>
                                <td><span class="status-badge status-${statusClass}">${request.matchStatus.replace('_', ' ')}</span></td>
                                <td class="text-center">
                                    <div class="action-menu">
                                        <button class="action-btn action-view" title="View Request" data-request-id="${request.id}"><i class="fas fa-eye"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        tableBody.append(requestRowHtml);
                    });
                }
                
                renderPagination(pageData.totalElements, requestList.length);
            },
            error: function(err) { /* ... */ }
        });
    }

    // --- Render Pagination Function ---
    function renderPagination(totalItems, currentEntryCount) {
        if (!totalItems || totalItems <= 0 || totalPages <= 1) {
            paginationContainer.empty();
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
    }

    // --- Get Search Suggestions Function ---
    function getSuggestions(query) {
        if (query.length < 2) {
            suggestionsPanel.empty().hide();
            return;
        }
        $.ajax({
            url: 'http://localhost:8080/request_manage/suggestions',
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
                        loadContactRequests(0);
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
            loadContactRequests(0);
        }
    });
    statusFilter.on('change', () => loadContactRequests(0));
    
    paginationContainer.on('click', '#prevBtn', () => { 
        if (currentPage > 0) loadContactRequests(currentPage - 1); 
    });
    
    paginationContainer.on('click', '#nextBtn', () => { 
        if (currentPage < totalPages - 1) loadContactRequests(currentPage + 1); 
    });
    
    $(document).on('click', function(e) { 
        if (!$(e.target).closest('.search-bar-local').length) { 
            suggestionsPanel.hide(); 
        } 
    });

    loadContactRequests(0);

    // =======================================================
    // ===       LOAD TOTAL Item COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalRequestCount() {
        $.ajax({
            url: 'http://localhost:8080/request_manage/total_request_count', // අලුත් endpoint එක
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            success: function(response) {

                totalCountEl.text(response.data);
                
            },
            error: function(err) {
                console.error("Failed to load total user count", err);
                totalCountEl.text('N/A'); // Error එකක් ආවොත් 'N/A' පෙන්වමු
            }
        });
    }

    loadTotalRequestCount();

});