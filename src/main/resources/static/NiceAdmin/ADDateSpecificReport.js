//----------------------------------Logout Api ----------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
    });
});
//----------------------------------User name Api -----------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch the user's name from the API
    function fetchUserName() {
        // Get the email from session data
        const email = sessionStorage.getItem('userEmail'); // Ensure this is how you fetch email from the session

        if (email) {
            fetch(`/api/admin/distributor/name?email=${encodeURIComponent(email)}`)
                .then(response => response.json())
                .then(data => {
                const userName = data.name || 'Guest'; // Use 'Guest' if no name is found
                // Update the HTML elements with the fetched name
                document.querySelector('.nav-profile .dropdown-toggle').textContent = userName;
                document.querySelector('.dropdown-header h6').textContent = userName;
            })
                .catch(error => {
                console.error('Error fetching name:', error);
                // Fallback to 'Guest' in case of an error
                document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
                document.querySelector('.dropdown-header h6').textContent = 'Guest';
            });
        } else {
            console.error('No email found in session.');
            // Fallback to 'Guest' if email is missing
            document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
            document.querySelector('.dropdown-header h6').textContent = 'Guest';
        }
    }

    // Call the function on page load
    fetchUserName();
});

//------------------------Token report Activity api --------------------------
document.addEventListener("DOMContentLoaded", function() {
    const userEmail = sessionStorage.getItem("userEmail"); // Assuming the email is stored in sessionStorage
    const activityList = document.getElementById("activity-list");
    const filterButton = document.getElementById("filter-button");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // Function to fetch activities with date range filter
    function fetchActivities(startDate = '', endDate = '') {
        let url = `/api/admin/distributor/AdminActivity?adminEmail=${userEmail}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
            // Clear any existing activities
            activityList.innerHTML = "";

            // Filter activities
            const filteredActivities = data.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                return (!startDate || activityDate >= new Date(startDate)) &&
                (!endDate || activityDate <= new Date(endDate));
            });

            // Check if there are filtered activities
            if (filteredActivities.length > 0) {
                filteredActivities.forEach(activity => {
                    // Determine the appropriate icon based on the activity type
                    let iconSrc = "assets/img/DefaultIcon.png"; // Default icon

                    switch (activity.type) {
                        case "TOKEN_SENT":
                            iconSrc = "assets/img/SendToken.png";
                            break;
                        case "TOKEN_RECEIPT":
                            iconSrc = "assets/img/RecievedToken.png";
                            break;
                        case "TOKEN_CREATION":
                        case "DISTRIBUTOR_CREATION":
                        case "RETAILER_CREATION":
                            iconSrc = "assets/img/CreateRetailer.png";
                            break;
                        case "DISTRIBUTOR_DELETION":
                        case "RETAILER_DELETION":
                            iconSrc = "assets/img/Deleter.png";
                            break;
                        default:
                            iconSrc = "assets/img/DefaultIcon.png"; // Fallback icon
                    }

                    // Create a new div element for each activity
                    const activityItem = document.createElement("div");
                    activityItem.className = "activity-item d-flex align-items-center";

                    // Set the inner HTML of the activity item
                    activityItem.innerHTML = `
                            <div class="activity-icon">
                                <img src="${iconSrc}" alt="${activity.type} icon" style="width: 24px; height: 24px; margin-right: 10px;">
                            </div>
                            <div class="activity-details">
                                <div class="activity-type">${activity.type}</div>
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-timestamp">${new Date(activity.timestamp).toLocaleString()}</div>
                            </div>
                        `;

                    // Append the activity item to the activity list
                    activityList.appendChild(activityItem);
                });
            } else {
                // No filtered activities found
                activityList.innerHTML = "<p>No activities found for the selected date range.</p>";
            }
        })
            .catch(error => {
            console.error("Error fetching activities:", error);
            activityList.innerHTML = "<p>Failed to load activities.</p>";
        });
    }

    // Fetch activities on page load
    fetchActivities();

    // Add event listener to filter button
    filterButton.addEventListener("click", function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        fetchActivities(startDate, endDate);
    });
});