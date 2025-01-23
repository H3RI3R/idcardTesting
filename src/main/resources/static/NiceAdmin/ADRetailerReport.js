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

    // Function to fetch activities
    function fetchActivities() {
        fetch(`/api/admin/distributor/AdminActivity?adminEmail=${userEmail}`)
            .then(response => response.json())
            .then(data => {
            // Clear any existing activities
            activityList.innerHTML = "";

            // Filter retailer-related activities
            const retailerActivities = data.filter(activity =>
            activity.type.includes("RETAILER_CREATION") ||
            activity.type.includes("RETAILER_DELETION")
            );

            // Check if there are retailer-related activities
            if (retailerActivities.length > 0) {
                retailerActivities.forEach(activity => {
                    // Determine the appropriate icon based on the activity type
                    let iconSrc = "assets/img/DefaultIcon.png"; // Default icon

                    if (activity.type.includes("RETAILER_CREATION")) {
                        iconSrc = "assets/img/CreateRetailer.png"; // Update with the correct path
                    } else if (activity.type.includes("RETAILER_DELETION")) {
                        iconSrc = "assets/img/Deleter.png"; // Update with the correct path
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
                // No retailer-related activities found
                activityList.innerHTML = "<p>No recent retailer activities found.</p>";
            }
        })
            .catch(error => {
            console.error("Error fetching activities:", error);
            activityList.innerHTML = "<p>Failed to load activities.</p>";
        });
    }

    // Fetch activities on page load
    fetchActivities();
});