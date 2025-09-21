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
    // ===       ALL MATCHES MANAGEMENT SCRIPT       ===
    // ===============================================

    // --- Selectors ---
    const searchInput = $('#matchSearch');
    const statusFilter = $('#status-filter');
    const tableBody = $('#matchesTableBody');
    const paginationContainer = $('#paginationContainer');
    const totalCountEl = $('#totalMatchesCount');
    const suggestionsPanel = $('#suggestionsPanel'); // Assuming you add this div in HTML
    const totalItemsCountEl = $('#totalMatchesCount');

    // --- State Management ---
    let currentPage = 0;
    let totalPages = 0;
    const pageSize = 3;

    // --- Debounce Function ---
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- Main Function to Load Matches ---
    function loadMatches(page = 0) {
        currentPage = page;
        const searchKeyword = searchInput.val().trim();
        const status = statusFilter.val();

        const filterData = {
            page: currentPage,
            size: pageSize
        };
        if (searchKeyword) filterData.search = searchKeyword;
        if (status && status !== 'all') filterData.status = status;

        tableBody.html('<tr><td colspan="8" class="text-center">Loading matches...</td></tr>');

        $.ajax({
            url: 'http://localhost:8080/match_item_manage/matches',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: filterData,
            success: function(response) {
                tableBody.empty();

                const pageData = response.data;
                const matchList = pageData.content;
                totalPages = pageData.totalPages;
                

                if (matchList.length === 0) {
                    tableBody.append('<tr><td colspan="8" class="text-center">No matches found.</td></tr>');
                } else {
                    matchList.forEach(match => {


                        console.log(match);
                        

                        const statusClass = match.matchStatus ? match.matchStatus.toLowerCase() : 'unknown';
                        const dateMatched = new Date(match.matchDate).toLocaleDateString('en-CA');

                        const matchRowHtml = `
                            <tr>
                                <td>
                                    <div class="item-cell">
                                        <img src="${match.lostItemImageUrl || 'https://via.placeholder.com/50'}" class="item-thumbnail">
                                        <div class="item-cell-info"><span class="item-title">${match.lostItemTitle}</span></div>
                                    </div>
                                </td>
                                <td>
                                    <div class="item-cell">
                                        <img src="${match.foundItemImageUrl || 'https://via.placeholder.com/50'}" class="item-thumbnail">
                                        <div class="item-cell-info"><span class="item-title">${match.foundItemTitle}</span></div>
                                    </div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${match.loserImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic">
                                        <span class="user-name">${match.loserFullName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${match.finderImageUrl || 'https://i.pravatar.cc/150'}" class="user-profile-pic">
                                        <span class="user-name">${match.finderFullName}</span>
                                    </div>
                                </td>
                                <td>${dateMatched}</td>
                                <td>${match.matchScore}</td>
                                <td><span class="status-badge status-${statusClass}">${match.matchStatus.replace('_', ' ')}</span></td>
                               
                            </tr>
                        `;
                        tableBody.append(matchRowHtml);
                    });
                }
                loadTotalItemCount();
                renderPagination(pageData.totalElements, matchList.length);
            },
            error: function(err) {
                console.error("Failed to load matches", err);
                tableBody.html('<tr><td colspan="8" class="text-center">Failed to load data. Please try again.</td></tr>');
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
            url: 'http://localhost:8080/match_item_manage/suggestions',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') },
            data: { query: query },
            success: function(response) {
                suggestionsPanel.empty();
              
                response.data.forEach(title => {
                    const item = $(`<div class="suggestion-item">${title}</div>`);
                    item.on('click', function() {
                        searchInput.val(title);
                        suggestionsPanel.hide();
                        loadMatches(0);
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

    // --- Event Listeners ---
    searchInput.on('input', debounce(function() { getSuggestions($(this).val()); }, 400));
    searchInput.on('keyup', function(e) {
        if (e.key === 'Enter' || $(this).val() === '') {
            suggestionsPanel.hide();
            loadMatches(0);
        }
    });
    statusFilter.on('change', () => loadMatches(0));
    paginationContainer.on('click', '#prevBtn', () => { if (currentPage > 0) loadMatches(currentPage - 1); });
    paginationContainer.on('click', '#nextBtn', () => { if (currentPage < totalPages - 1) loadMatches(currentPage + 1); });
    $(document).on('click', function(e) { if (!$(e.target).closest('.search-bar-local').length) { suggestionsPanel.hide(); } });

    // --- Initial Load ---
    loadMatches(0);

    // =======================================================
    // ===       LOAD TOTAL Item COUNT (NEW FUNCTION)      ===
    // =======================================================
    function loadTotalItemCount() {
        $.ajax({
            url: 'http://localhost:8080/match_item_manage/total_item_count', // අලුත් endpoint එක
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