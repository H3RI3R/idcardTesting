
  document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;

    // Fetch and display the wallet address
    fetchWalletAddress(userEmail).then(walletAddress => {
      fetchTokenCount(walletAddress);
      fetchRetailerCount(userEmail);
    });
  });

  //Create ID Card  -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve retailerEmail from session storage
    const retailerEmail = sessionStorage.getItem('userEmail');

    // Handle the create ID card form submission
    document.getElementById('createIdCardForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const businessName = document.getElementById('businessName').value;
        const businessAddress = document.getElementById('businessAddress').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const emailAddress = document.getElementById('emailAddress').value;
        const permanentAddress = document.getElementById('permanentAddress').value;
        const currentAddress = document.getElementById('currentAddress').value;
        const photo = document.getElementById('photo').files[0];

        const formData = new FormData();
        formData.append('retailerEmail', retailerEmail); // Use retailerEmail from session
        formData.append('name', name);
        formData.append('businessName', businessName);
        formData.append('businessAddress', businessAddress);
        formData.append('phoneNumber', phoneNumber);
        formData.append('emailAddress', emailAddress);
        formData.append('permanentAddress', permanentAddress);
        formData.append('currentAddress', currentAddress);
        formData.append('photo', photo);

        fetch('http://localhost:8080/api/admin/retailer/create-idcard', {
            method: 'POST',
            body: formData
        })
        .then(response => response.blob()) // Get the response as a Blob
              .then(blob => {
                  // Create a URL for the Blob
                  const url = window.URL.createObjectURL(blob);

                  // Create an iframe to print the ID card
                  const iframe = document.createElement('iframe');
                  iframe.style.position = 'absolute';
                  iframe.style.width = '0';
                  iframe.style.height = '0';
                  iframe.style.border = '0';
                  document.body.appendChild(iframe);

                  iframe.onload = function() {
                      iframe.contentWindow.print();
                      alert('ID card is printing...');
                      document.body.removeChild(iframe);
                       document.getElementById('createIdCardForm').reset();
                  };

                  iframe.src = url;
              })
              .catch(error => {
                  console.error('Error creating ID card:', error);
                  alert('Error creating ID card: ' + error.message);
              });
          });
      });



    //show  Retailer --------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function() {
      // Existing code...

      // Handle the "Show Retailers" button click
      document.getElementById('showRetailersBtn').addEventListener('click', function() {
        // Retrieve creator email from session
        const creatorEmail = sessionStorage.getItem('userEmail');

        // Check if creatorEmail is available
        if (!creatorEmail) {
          alert('User email not found in session.');
          return;
        }

        // Construct the URL for the API request
        const apiUrl = `http://localhost:8080/api/admin/retailer/list-by-creator?creatorEmail=${encodeURIComponent(creatorEmail)}`;

        // Make the API request
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            const retailers = data.retailers || [];

            // Clear existing table data
            const tableBody = document.getElementById('retailersTableBody');
            tableBody.innerHTML = '';

            // Populate the table with retailer data
            retailers.forEach(retailer => {
              const row = document.createElement('tr');
              const emailCell = document.createElement('td');
              emailCell.innerText = retailer.email;
              row.appendChild(emailCell);
              tableBody.appendChild(row);
            });

            // Update the total number of retailers
            document.getElementById('totalRetailers').innerText = retailers.length;

            // Show the table
            document.getElementById('retailersTable').style.display = 'block';
          })
          .catch(error => {
            console.error('Error fetching retailers:', error);
            alert('Error fetching retailers. Please try again.');
          });
      });
    });
  //delete Retailer --------------------------------------------------------
 document.addEventListener('DOMContentLoaded', function() {
   // Handle form submission for deleting retailer
   document.getElementById('deleteRetailerForm').addEventListener('submit', function(event) {
     event.preventDefault(); // Prevent default form submission

     const deleteRetailerEmail = document.getElementById('deleteRetailerEmail').value.trim();

     // Retrieve creator email from session
     const creatorEmail = sessionStorage.getItem('userEmail');

     // Check if creatorEmail is available
     if (!creatorEmail) {
       alert('User email not found in session.');
       return;
     }

     // Construct the URL for the API request
     const apiUrl = `http://localhost:8080/api/admin/retailer/delete?email=${encodeURIComponent(deleteRetailerEmail)}&creatorEmail=${encodeURIComponent(creatorEmail)}`;

     // Make the API request
     fetch(apiUrl, {
       method: 'POST'
     })
     .then(response => response.json())
     .then(data => {
       console.log('API Response:', data); // Log the response for debugging

       // Check if message indicates success
       if (data.message === "Retailer deleted successfully") {
         alert('Retailer deleted successfully!');
         document.getElementById('deleteRetailerForm').reset(); // Reset form after successful deletion
         // Optionally, you might want to refresh the list of retailers here
       } else {
         alert('Failed to delete retailer: ' + (data.error || 'Unknown error'));
       }
     })
     .catch(error => {
       console.error('Error deleting retailer:', error);
       alert('Error deleting retailer. Please try again.');
     });
   });
 });

  //Create Retailer --------------------------------------------------------
   document.addEventListener('DOMContentLoaded', function() {
     // Handle form submission
     document.getElementById('createRetailerForm').addEventListener('submit', function(event) {
       event.preventDefault(); // Prevent default form submission

       // Retrieve form values
       const retailerEmail = document.getElementById('retailerEmail').value.trim();
       const retailerPassword = document.getElementById('retailerPassword').value.trim();
       const retailerPNumber = document.getElementById('retailerPNumber').value.trim();

       // Retrieve creator email from session
       const creatorEmail = sessionStorage.getItem('userEmail');

       // Check if creatorEmail is available
       if (!creatorEmail) {
         alert('User email not found in session.');
         return;
       }

       // Construct the URL for the API request
       const apiUrl = `http://localhost:8080/api/admin/retailer/create?email=${encodeURIComponent(retailerEmail)}&password=${encodeURIComponent(retailerPassword)}&phoneNumber=${encodeURIComponent(retailerPNumber)}&requestingUserRole=DISTRIBUTOR&creatorEmail=${encodeURIComponent(creatorEmail)}`;

       // Make the API request
       fetch(apiUrl, {
         method: 'POST'
       })
       .then(response => response.json())
       .then(data => {
         console.log('API Response:', data); // Log the response for debugging

         // Check if message indicates success
         if (data.message === "Retailer created successfully") {
           alert('Retailer created successfully!');
           document.getElementById('createRetailerForm').reset(); // Reset form after successful creation
         } else {
           alert('Failed to create retailer: ' + (data.message || 'Unknown error'));
         }
       })
       .catch(error => {
         console.error('Error creating retailer:', error);
         alert('Error creating retailer. Please try again.');
       });
     });
   });

  function fetchWalletAddress(email) {
    return fetch(`http://localhost:8080/api/admin/token/getWalletAddress?email=${email}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('walletAddress').innerText = data.walletAddress;
        return data.walletAddress;
      })
      .catch(error => console.error('Error fetching wallet address:', error));
  }
 function fetchRetailerCount(creatorEmail) {
    fetch(`http://localhost:8080/api/admin/retailer/list-by-creator?creatorEmail=${creatorEmail}`)
      .then(response => response.json())
      .then(data => {
        if (data.retailers) {
          // Update the HTML element with the total count
          document.getElementById('totalRetailers').innerText = data.retailers.length;
        } else {
          // Handle case where retailers are not present in response
          document.getElementById('totalRetailers').innerText = '0';
        }
      })
      .catch(error => console.error('Error fetching retailer count:', error));
  }
  function fetchTokenCount(walletAddress) {
    fetch(`http://localhost:8080/api/admin/token/count?walletAddress=${walletAddress}`)
      .then(response => response.json())
      .then(data => {
        document.querySelector('.card-balance').innerText = data.tokenCount;
      })
      .catch(error => console.error('Error fetching token balance:', error));
  }

  document.getElementById('refreshTokensBtn').addEventListener('click', function() {
    const walletAddress = document.getElementById('walletAddress').innerText;
    fetchTokenCount(walletAddress);
  });

  document.getElementById('logoutBtn').addEventListener('click', function() {
    sessionStorage.clear(); // Clear session storage
  });