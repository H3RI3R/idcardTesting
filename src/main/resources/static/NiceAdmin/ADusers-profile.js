
//----------------------------------User details Api ----------------------------------
 const userEmail = sessionStorage.getItem('userEmail');

  // Function to fetch user info from API
  function fetchUserInfo(email) {
    // If no email found in sessionStorage, show alert and exit
    if (!email) {
      alert('You are on a guest profile');
      return;
    }

    // Construct the API URL with the email
    const apiUrl = `/api/admin/distributor/userInfo?email=${email}`;

    // Make the fetch request
    fetch(apiUrl)
      .then(response => response.json())  // Parse the JSON response
      .then(data => {
        // Populate the form fields with the data from the API
        document.getElementById("nameFull").innerText = data.name || "N/A";
        document.getElementById("company").innerText = data.company || "N/A";
        document.getElementById("companyAddress").innerText = data.companyAddress || "N/A";
        document.getElementById("address").innerText = data.address || "N/A";
        document.getElementById("phone").innerText = data.phoneNumber || "N/A";
        document.getElementById("email").innerText = data.email || "N/A";
         document.getElementById("userEmail1").innerText = data.name || "Guest";
                document.getElementById("userRole").innerText = data.role || "N/A";
                  document.getElementById("userRole1").innerText = data.role || "N/A";
      })
      .catch(error => {
        console.error("Error fetching user info:", error);
        alert("An error occurred while fetching user information.");
      });
  }

  // Call the fetchUserInfo function with the userEmail from sessionStorage
  fetchUserInfo(userEmail);
//----------------------------------User name Api ----------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the user email from session storage
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
        console.error('User email is not set in session storage');
        return;
    }

    // API URL with user email
    const apiUrl = `/api/admin/distributor/name?email=${encodeURIComponent(userEmail)}`;

    // Fetch the user data from the API
    fetch(apiUrl)
        .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
    })
        .then(data => {
        // Update the HTML elements with the fetched data
        const name = data.name || 'Guest'; // Default to 'Guest' if name is not available

        document.getElementById('userEmail1').textContent = name;
        document.getElementById('userEmail').textContent =name;
        document.getElementById('nameFull').textContent = name;
        document.getElementById('profileName').textContent = name;
    })
        .catch(error => {
        console.error('Error fetching user data:', error);
    });
});



//--------------------------------Logout Button api ------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
    });
});