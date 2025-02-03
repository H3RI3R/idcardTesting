document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');

    if (!userEmail) {
        alert('You are on a guest profile');
        return;
    }

    const apiUrl = `${API_URL}/api/admin/distributor/userInfo?email=${encodeURIComponent(userEmail)}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
//            console.log("🔍 API Response:", data);

            if (!data || Object.keys(data).length === 0) {
                alert("No user data found. Please check your email.");
                return;
            }

            // Update profile fields
            updateElementText("nameFull", data.name);
            updateElementText("company", data.company);
            updateElementText("address", data.companyAddress);
            updateElementText("designation", data.role);
            updateElementText("phone", data.phoneNumber);
            updateElementText("email", data.email);

            // Update profile header & dropdown
            updateElementText("profileName", data.name);
            updateElementText("userEmail", data.name);
            updateElementText("userEmail1", data.name);
            updateElementText("userRole", data.role);
            updateElementText("profileName", data.name);

            const profileDropdown = document.querySelector('.nav-profile .dropdown-toggle');
            if (profileDropdown) profileDropdown.textContent = data.name;
        })
        .catch(error => {
            console.error("❌ Error fetching user info:", error);
            alert("An error occurred while fetching user information.");
        });
});

// 🔹 Helper function to safely update text content
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text || "N/A";
    } else {
        console.warn(`⚠️ Element with ID '${elementId}' not found.`);
    }
}
//----------------------------------User name Api ----------------------------------



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