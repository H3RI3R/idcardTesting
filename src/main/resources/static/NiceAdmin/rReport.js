document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});



//---------------------------------- Table  Api -----------------------------------
document.addEventListener("DOMContentLoaded", function() {
    const retailerTableBody = document.getElementById("retailerTableBody");

    // Fetch ID Card history using the session data (userEmail)
    async function fetchIdCardHistory() {
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            alert("User email not found in session.");
            return;
        }

        try {
            const response = await fetch(`/api/admin/retailer/idcard-history?retailerEmail=${encodeURIComponent(userEmail)}`);
            const data = await response.json();

            if (data.error) {
                alert(`Error: ${data.error}`);
                return;
            }

            // Clear existing table data
            retailerTableBody.innerHTML = "";

            if (data.idCardHistory && data.idCardHistory.length > 0) {
                // Populate table with the fetched ID card history details
                data.idCardHistory.forEach(idCard => {
                    const row = document.createElement("tr");

                    // Mask phone number, showing only the last 4 digits
                    const maskedPhoneNumber = idCard.phoneNumber.slice(-4).padStart(idCard.phoneNumber.length, '*');

                    // Parse the creationDateTime string from the backend response
                    const creationDate = new Date(idCard.creationDateTime);

                    // Check if creationDate is valid
                    let formattedDate = "Invalid Date";
                    if (!isNaN(creationDate.getTime())) {
                        // If valid, format it properly
                        formattedDate = creationDate.toLocaleString();
                    }

                    row.innerHTML = `
                        <td>${idCard.name}</td>
                        <td>${maskedPhoneNumber}</td>
                        <td>${idCard.businessName}</td>
                        <td>Success</td>
                        <td>${idCard.id}</td>
                        <td>${formattedDate}</td>
                    `;
                    retailerTableBody.appendChild(row);
                });
            } else {
                retailerTableBody.innerHTML = `<tr><td colspan="6">No ID cards found.</td></tr>`;
            }

            // Initialize DataTable
            new simpleDatatables.DataTable("#idCardTable", {
                searchable: true,
                fixedHeight: true,
                perPageSelect: [5, 10, 15, 20],
            });
        } catch (error) {
            console.error("Error fetching ID Card history:", error);
            alert("An error occurred while fetching the ID Card history.");
        }
    }

    // Call the fetch function on page load
    fetchIdCardHistory();
});
//----------------------------------USerName Api ----------------------------------
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

//----------------------------------Logout Api ----------------------------------


document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
    });
});
//----------------------------------Toggle nav bar Api ----------------------------------
(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el) => {
        return document.querySelector(el.trim());
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener) => {
        const element = select(el);
        if (element) {
            element.addEventListener(type, listener);
        }
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function() {
            select('body').classList.toggle('toggle-sidebar');
        });
    }
})();
//-------------------------------------------------------
