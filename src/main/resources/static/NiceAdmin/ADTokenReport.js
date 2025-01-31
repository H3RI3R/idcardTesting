document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});
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
            fetch(`${API_URL}/api/admin/distributor/name?email=${encodeURIComponent(email)}`)
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


   //------------------------Token report Activity API --------------------------
      // JavaScript to fetch and populate table data
  //------------------------Token report Activity API --------------------------
  // JavaScript to fetch and populate table data
  async function fetchAdminActivities() {
      const adminEmail = sessionStorage.getItem('userEmail');
      const activityResponse = await fetch(`${API_URL}/api/admin/distributor/AdminActivity?adminEmail=${encodeURIComponent(adminEmail)}`);
      const activities = await activityResponse.json();

      const tableDataPromises = activities.map(async (activity) => {
          const { id, type, description, timestamp, transactionId, openingBalance, closingBalance } = activity;

          // Log all activity types for debugging
//          console.log("Activity Type:", type);

          // Only process TOKEN_CREATION and TOKEN_SENT
          if (type !== 'TOKEN_CREATION' && type !== 'TOKEN_SENT') return null;

          let identifier;
          let userInfoUrl;

          if (type === 'TOKEN_CREATION') {
              identifier = adminEmail;
              userInfoUrl = `${API_URL}/api/admin/distributor/userInfo?email=${encodeURIComponent(identifier)}`;
          } else if (type === 'TOKEN_SENT') {
              // Extract email from description
              const emailMatch = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
              if (emailMatch) {
                  identifier = emailMatch[0]; // Extracted email
                  userInfoUrl = `${API_URL}/api/admin/distributor/userInfo?email=${encodeURIComponent(identifier)}`;
              } else {
                  console.error('Description does not contain a valid email for TOKEN_SENT type.');
                  return null;
              }
          }

          const userInfoResponse = await fetch(userInfoUrl);
          const userInfo = await userInfoResponse.json();

          // Extract amount from description
          const amountMatch = description ? description.match(/\d+/) : null;
          const amount = amountMatch ? parseInt(amountMatch[0], 10) : null;

          const dateObj = new Date(timestamp);
          const date = dateObj.toLocaleDateString();
          const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const formattedDateTime = `${date}, ${time}`;

          return {
              id: userInfo.id,
              date: formattedDateTime,
              name: userInfo.name,
              number: identifier,
              openingBalance: openingBalance,
              amount: amount,
              closingBalance: closingBalance,
              status: type === 'TOKEN_CREATION' ? 'Credit' : 'Debit',
              description: description,
              transactionId: transactionId,
              role: userInfo.role // Capture the role information
          };
      });

      const tableData = await Promise.all(tableDataPromises);
      const filteredData = tableData.filter(data => data !== null); // Remove null entries
//      console.log("Filtered Data:", filteredData); // Log to check if data is being filtered correctly
      populateTable(filteredData);
  }

  function populateTable(tableData) {
      // Ensure the table body exists
      const tableBody = document.getElementById('activity-table-body');

      // If the table body is not found, log an error and exit early
      if (!tableBody) {
          console.error("Error: Could not find table body element.");
          return;
      }

      tableBody.innerHTML = ''; // Clear any existing rows

      // Check if tableData is empty and log the state
      if (tableData.length === 0) {
          console.log("No data to display in table.");
          tableBody.innerHTML = "<tr><td colspan='10'>No data available</td></tr>";
          return;
      }

      tableData.forEach(data => {
          const statusImage = data.status === 'Credit'
              ? 'assets/img/credit.png'
              : 'assets/img/debit.png';

          const row = `<tr>
              <td>${data.id}</td>
              <td style="background-color: #d9d9d9;">${data.date}</td>
              <td style="color: #318CE7;">${data.name}</td>
              <td>${data.number}</td>
              <td>${data.openingBalance}</td>
              <td>${data.amount}</td>
              <td>${data.closingBalance}</td>
              <td><img src="${statusImage}" style="width: 45px; height: 20px;"/></td>
              <td>${data.transactionId}</td>
              <td>${data.role}</td> <!-- New column for Role -->
          </tr>`;
          tableBody.insertAdjacentHTML('beforeend', row);
      });

      // Initialize Simple DataTables after the table is populated
      const dataTable = new simpleDatatables.DataTable("#activityTable", {
          searchable: true,
          fixedHeight: true,
          perPageSelect: [5, 10, 15, 20],
      });

      // Update pagination controls
      dataTable.on('datatable.init', () => {
          const paginationControls = document.querySelector('.pagination-controls');
//          paginationControls.innerHTML = '';
//          paginationControls.appendChild(dataTable.tableWrapper.querySelector('.dataTable-pagination'));
      });
  }

  document.addEventListener('DOMContentLoaded', fetchAdminActivities);
//-------------------------------------__toggle bar
  (function() {
      "use strict";

      /**
       * Easy selector helper function
       */
      const select = (el, all = false) => {
          el = el.trim()
          if (all) {
              return [...document.querySelectorAll(el)]
          } else {
              return document.querySelector(el)
          }
      }

      /**
       * Easy event listener function
       */
      const on = (type, el, listener, all = false) => {
          if (all) {
              select(el, all).forEach(e => e.addEventListener(type, listener))
          } else {
              select(el, all).addEventListener(type, listener)
          }
      }



      /**
       * Sidebar toggle
       */
      if (select('.toggle-sidebar-btn')) {
          on('click', '.toggle-sidebar-btn', function(e) {
              select('body').classList.toggle('toggle-sidebar')
          })
      }
  })();