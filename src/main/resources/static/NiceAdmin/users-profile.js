document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');

    // Fetch data from the API
    fetch(`${API_URL}/api/admin/distributor/list`)
        .then(response => response.json())
        .then(data => {
        // Find the user data that matches the session email
        const userData = data.find(user => user.email === userEmail);

        if (userData) {
            // Populate the HTML with the user data
            document.getElementById('nameFull').textContent = userData.name;
            document.getElementById('company').textContent = userData.company || 'Not Available';
            document.getElementById('designation').textContent = userData.job || 'Not Available';
            document.getElementById('role').textContent = userData.role || 'Not Available';
            document.getElementById('address').textContent = userData.address || 'Not Available';
            document.getElementById('phone').textContent = userData.phoneNumber || 'Not Available';
            document.getElementById('email').textContent = userData.email;

            // Update other sections of the page if needed
            document.querySelector('.nav-profile .dropdown-toggle').textContent = userData.name;
            document.querySelector('.dropdown-header h6').textContent = userData.name;
        } else {
            // Handle case where no matching user is found
            document.getElementById('nameFull').textContent = 'Guest';
            document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
            document.querySelector('.dropdown-header h6').textContent = 'Guest';
        }
    })
        .catch(error => {
        console.error('Error fetching user data:', error);
        // Handle error case
    });
});
//----------------------------------User name Api ----------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Function to fetch the user's name from the API
    function fetchUserName() {
        // Get the email from session data
        const email = sessionStorage.getItem('userEmail'); // Ensure this is how you fetch email from the session

        if (email) {
            fetch(`${API_URL}/api/admin/distributor/name?email=${encodeURIComponent(email)}`)
                .then(response => response.json())
                .then(data => {
                const userName = data.name || 'Guest'; // Use 'Guest' if no name is found
                // Update the HTML elements with the fetched name
                document.querySelector('.nav-profile .dropdown-toggle').textContent = userName;
                document.querySelector('.dropdown-header h6').textContent = userName;
                document.getElementById("profileName").textContent = userName;
                document.getElementById("nameFull").textContent = userName;
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


//--------------------------------Logout Button api ------------------------
const userEmail = sessionStorage.getItem('userEmail');
function fetchUserInfo(email) {
    if (!email) {

      return;
    }
    const apiUrl = `${API_URL}/api/admin/distributor/userInfo?email=${email}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
                document.getElementById("userRole").innerText = data.role || "N/A";
      })
      .catch(error => {
        console.error("Error fetching user info:", error);
        alert("An error occurred while fetching user information.");
      });
  }
  fetchUserInfo(userEmail);

//--------------------------------Logout Button api ------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
    });
});