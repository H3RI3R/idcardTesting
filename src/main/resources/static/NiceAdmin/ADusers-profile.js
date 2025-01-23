
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