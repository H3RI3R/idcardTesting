 const userEmail = sessionStorage.getItem('userEmail');
  function fetchUserInfo(email) {
    if (!email) {
      alert('You are on a guest profile');
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
//---------------------table apis-----------------------
document.addEventListener('DOMContentLoaded', function () {
  const userEmail = sessionStorage.getItem('userEmail'); // Fetch session storage userEmail
  const transactionTableBody = document.getElementById('transactionTableBody');
  const searchInput = document.getElementById('searchTransactionId');
  const refreshButton = document.getElementById('refreshButton');

  // Fetch and display transactions
  function fetchAndDisplayTransactions() {
    fetch(`${API_URL}/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}&userEmail=${userEmail}`)
      .then(response => response.json())
      .then(data => {
        transactionTableBody.innerHTML = ''; // Clear the table body

        // Filter the data based on search input
        const filteredData = data.filter(transaction =>
          !searchInput.value || transaction.transactionId.includes(searchInput.value)
        );

        filteredData.forEach((transaction, index) => {
          // Determine the request type based on the current user
          let type = '';
          if (transaction.userEmail === userEmail) {
            type = 'Request Sent';
          } else if (transaction.creatorEmail === userEmail) {
            type = 'Request Received';
          }

          // Format the date (remove time)
          const date = new Date(transaction.timestamp).toLocaleDateString();

          // Determine the status image based on transaction status
          let statusImage = '';
          switch (transaction.status) {
            case 'Pending':
              statusImage = 'assets/img/pending.png';
              break;
            case 'Rejected':
              statusImage = 'assets/img/rejected.png';
              break;
            case 'Accepted':
              statusImage = 'assets/img/success.png';
              break;
            default:
              statusImage = 'assets/img/default.png'; // Fallback image
          }

          // Create a table row
          const row = `
            <tr>
              <td>${index + 1}</td>
              <td>${date}</td>
              <td>${Math.round(transaction.amount)}</td>
              <td><img src="${statusImage}" alt="${transaction.status}" style="height: 20px;"></td>
              <td>${transaction.transactionId}</td>
              <td>${type}</td>
              <td>
                ${transaction.status === 'Pending' && type === 'Request Received' ? `
                  <button class="btn btn-sm btn-success me-2" onclick="updateStatusAndSendToken('${transaction.transactionId}', '${transaction.userEmail}')">Accept</button>
                  <button class="btn btn-sm btn-danger" onclick="updateStatus('${transaction.transactionId}', 'Rejected')">Reject</button>
                ` : ''}
              </td>
            </tr>
          `;
          transactionTableBody.innerHTML += row;
        });
      })
      .catch(error => console.error('Error fetching transaction requests:', error));
  }

  // Function to update transaction status (only refresh table and show alert)
  window.updateStatus = function (transactionId, status) {
    fetch(`${API_URL}/api/admin/distributor/updateTransactionStatus?transactionId=${transactionId}&status=${status}`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          // Display an alert for successful update (accepted or rejected)
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: `Transaction ${status.toLowerCase()} successfully!`,
            confirmButtonText: 'OK'
          }).then(() => {
            // Refresh the table after the status update
            fetchAndDisplayTransactions();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'An error occurred',
            confirmButtonText: 'OK'
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the status',
          confirmButtonText: 'OK'
        });
        console.error('Error:', error);
      });
  };

  // Function to fetch token amount
  function fetchTokenAmount(transactionId) {
    return fetch(`${API_URL}/api/admin/tokenAmount/viewByTransactionId?transactionId=${transactionId}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          return data[0].tokenAmount; // Access the first item of the array
        } else {
          throw new Error('Token amount not found in response.');
        }
      })
      .catch(error => {
        console.error('Error fetching token amount:', error);
        throw new Error('Failed to fetch token amount.');
      });
  }
  // Function to update transaction status and send tokens
  window.updateStatusAndSendToken = function (transactionId, recipientEmail) {
    fetchTokenAmount(transactionId)
      .then(tokenAmount => {
        if (tokenAmount <= 0 || isNaN(tokenAmount)) {
          throw new Error('Invalid token amount.');
        }

        return fetch(`${API_URL}/api/admin/distributor/updateTransactionStatus?transactionId=${transactionId}&status=Accepted`, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(statusData => {
          if (!statusData.message) {
            throw new Error(statusData.error || 'An error occurred while updating the status');
          }

          return fetch(`${API_URL}/api/admin/token/send?senderIdentifier=${userEmail}&amount=${tokenAmount}&recipient=${recipientEmail}`, {
            method: 'POST'
          });
        });
      })
      .then(response => response.json())
      .then(tokenData => {
        if (tokenData.message) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Token sent successfully!',
            confirmButtonText: 'OK'
          }).then(() => {
            fetchAndDisplayTransactions();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: tokenData.error || 'An error occurred while sending the token',
            confirmButtonText: 'OK'
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An error occurred',
          confirmButtonText: 'OK'
        });
        console.error('Error:', error);
      });
  };

  // Fetch transactions on page load
  fetchAndDisplayTransactions();

  // Refresh button event listener
  refreshButton.addEventListener('click', fetchAndDisplayTransactions);

  // Search input event listener
  searchInput.addEventListener('input', fetchAndDisplayTransactions);
});
    //  ------------------------------Create transection request api------------------------------------------

    document.addEventListener("DOMContentLoaded", function() {
      const doneButton = document.getElementById("doneButton");

      doneButton.addEventListener("click", function() {
        const transactionID = document.getElementById("bankTransactionID1").value;
        const amount = document.getElementById("payableAmount").textContent.match(/\d+/)[0]; // Amount in rupees
        const email = sessionStorage.getItem('userEmail'); // User's email
        const tokenAmount = document.getElementById('inputTokenAmount').value; // Number of tokens requested

        if (!transactionID) {
          alert("Please enter the transaction ID.");
          return;
        }

        // Create Transaction Request API call
        fetch(`${API_URL}/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
          method: 'POST'
        })
          .then(response => response.json())
          .then(data => {
            if (data.message) {
              showAlert("Payment request submitted successfully.");
              closeModal(this.id === 'bankDoneButton1' ? 'bankTransferModal1' : 'upiModal1');
            } else {
              showAlert("Error: " + (data.error || "Unknown error"));
            }
          })
          .catch(error => {
            showAlert("Error: " + error.message);
          });
      });

      function showAlert(message) {
        const alert = document.getElementById("paymentAlert");
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.textContent = message;
        alert.classList.remove("d-none");
      }
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
    //--------------------------------Logout api ----------------------
    document.addEventListener("DOMContentLoaded", function() {
      // Add event listener to the logout button
      document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
      });
    });

    //---------------------------------- Alert & gneerate QR code Function  ----------------------------------
    function generateQRCode() {
      // Get the selected plan amount
      var amount = document.getElementById('selectPlan').value;

      // Receiver's UPI ID
      var upiID = "ritiksoni101@ybl";

      // Construct the UPI Payment URL
      var upiUrl = `upi://pay?pa=${upiID}&pn=Ritik&am=${amount}&cu=INR`;

      // Clear any previous QR code
      document.getElementById("qrcode").innerHTML = "";

      // Generate the QR Code
      var qrcode = new QRCode(document.getElementById("qrcode"), {
        text: upiUrl,
        width: 200,  // QR Code width
        height: 200, // QR Code height
      });
    }

    // Event listener for Done button
    document.getElementById('doneButton').addEventListener('click', function() {
      // Get the selected plan text
      var selectedPlan = document.querySelector('select[name="amount"] option:checked').textContent;

      // Get the transaction ID
      var transactionID = document.getElementById('transactionID').value;

      // Validate transaction ID input
      if (transactionID === '') {
        alert('Please enter the transaction ID.');
        return;
      }

      // Construct the alert message
      var alertMessage = `Your request for the <strong>${selectedPlan}</strong> has been sent. Please wait while we process. Or check your status from <a href="ADTokenReport.html" class="alert-link">here</a>.`;

      // Display the alert with the message
      document.getElementById('alertMessage').innerHTML = alertMessage;
      document.getElementById('paymentAlert').classList.remove('d-none');

      // Hide the modal
      var paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
      paymentModal.hide();
    });



    // ------------------------------------------ Account API ----------------------------------------------------------
// const userEmail = sessionStorage.getItem('userEmail');
 let selectedAccountId = null; // Variable to hold the currently selected account ID
 let currentIdentifier = ''; // To store the current identifier
 let currentName = ''; // To store the current name
 let selectedIdentifier = ''; // To store the identifier for activation/deactivation

 // Function to fetch API data and populate the table
 function fetchAndDisplayAccounts() {
     fetch(`${API_URL}/api/admin/bank/view?email=${userEmail}`)
         .then(response => response.json())
         .then(data => {
             const tableBody = document.getElementById('accountTableBody');
             tableBody.innerHTML = ''; // Clear existing rows

             data.forEach(account => {
                 const row = document.createElement('tr');

                 // Determine account type and status
                 let accountType = account.identifier
                     ? account.identifier.includes('@') ? 'UPI Account' : 'Bank Account'
                     : 'Unknown';

                 const identifier = account.identifier || 'N/A';
                 const name = account.name || 'N/A';
                 const status = account.status || 'N/A';

                 // Determine status button based on the account status
                 const statusButton = status === 'ACTIVE'
                     ? `<button class="btn btn-success btn-sm" onclick="openDeactivateModal('${identifier}')">Active</button>`
                     : `<button class="btn btn-dark btn-sm" onclick="openActivateModal('${identifier}')">Deactivate</button>`;

                 row.innerHTML = `
                     <td>${account.id}</td>
                     <td>${accountType}</td>
                     <td>${identifier}</td>
                     <td>${name}</td>
                     <td>
                       <button class="btn btn-warning btn-sm" onclick="openEditModal(${account.id}, '${identifier}', '${name}')">Edit</button>
                       <button class="btn btn-danger btn-sm" onclick="deleteAccount('${account.id}', '${identifier}')">Delete</button>
                       ${statusButton}
                     </td>
                 `;

                 tableBody.appendChild(row);
             });
         })
         .catch(error => {
             console.error('Error fetching accounts:', error);
         });
 }

 // Function to open the edit modal and populate fields
 function openEditModal(id, identifier, name) {
     selectedAccountId = id; // Store the current account ID for reference
     currentIdentifier = identifier;
     currentName = name;

     // Set modal input fields with current values
     document.getElementById('editIdentifier').value = identifier;
     document.getElementById('editName').value = name;

     const editModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
     editModal.show();
 }

 // Function to save changes and call the API
 function saveChanges() {
     const newIdentifier = document.getElementById('editIdentifier').value;
     const newName = document.getElementById('editName').value;

     let changeIdentifier = '';
     let changeName = '';

     let isIdentifierChanged = false;
     let isNameChanged = false;

     // Check if the identifier was changed
     if (newIdentifier !== currentIdentifier) {
         changeIdentifier = newIdentifier; // Send new identifier to API
         isIdentifierChanged = true;
     }

     // Check if the name was changed
     if (newName !== currentName) {
         changeName = newName; // Send new name to API
         isNameChanged = true;
     }

     // If neither identifier nor name was changed, exit the function
     if (!isIdentifierChanged && !isNameChanged) {
         showAlert('warning', 'No changes were made.');
         return;
     }

     // Prepare the API URL with the parameters for both changes
     let apiUrl = `${API_URL}/api/admin/bank/modify?email=${userEmail}&identifier=${currentIdentifier}`;

     // Append parameters conditionally based on what was changed
     if (isIdentifierChanged) {
         apiUrl += `&changeIdentifier=${encodeURIComponent(changeIdentifier)}`;
     }
     if (isNameChanged) {
         apiUrl += `&changeName=${encodeURIComponent(changeName)}`;
     }

     fetch(apiUrl, {
         method: 'PUT',
         headers: {
             'Content-Type': 'application/json'
         }
     })
         .then(response => response.json())
         .then(data => {
             if (data.status === 'success') {
                 // Show success message based on what was changed
                 let successMessage = '';
                 if (isIdentifierChanged && isNameChanged) {
                     successMessage = 'Identifier and Name have been successfully changed.';
                 } else if (isIdentifierChanged) {
                     successMessage = 'Identifier has been successfully changed.';
                 } else if (isNameChanged) {
                     successMessage = 'Name has been successfully changed.';
                 }

                 showAlert('success', successMessage);
                 fetchAndDisplayAccounts(); // Refresh the account table

                 const editModal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
                 editModal.hide(); // Close the modal
             } else {
                 showAlert('danger', 'Failed to modify the account.');
             }
         })
         .catch(error => {
             console.error('Error modifying account:', error);
             showAlert('danger', 'An error occurred while modifying the account.');
         });
 }

 // Function to open the deactivate confirmation modal
 function openDeactivateModal(identifier) {
     selectedIdentifier = identifier; // Store the identifier of the account
     const deactivateModal = new bootstrap.Modal(document.getElementById('deactivateModal'));
     deactivateModal.show();
 }

 // Function to deactivate the account after confirmation
 function deactivateAccount() {
     fetch(`${API_URL}/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=DEACTIVE`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         }
     })
     .then(response => response.text()) // Handle plain text response
     .then(text => {
         if (text === 'Bank status updated successfully') {
             showAlert('success', 'Account has been deactivated.');
             fetchAndDisplayAccounts(); // Refresh the account table

             const deactivateModal = bootstrap.Modal.getInstance(document.getElementById('deactivateModal'));
             deactivateModal.hide(); // Close the modal
         } else {
             showAlert('danger', 'Failed to deactivate the account.');
         }
     })
     .catch(error => {
         console.error('Error deactivating account:', error);
         showAlert('danger', 'An error occurred while deactivating the account.');
     });
 }

 // Function to open the activate confirmation modal
 function openActivateModal(identifier) {
     selectedIdentifier = identifier; // Store the identifier of the account
     const activateModal = new bootstrap.Modal(document.getElementById('activateAccountModal'));
     activateModal.show();
 }

 // Function to activate the account after confirmation
 function activateAccount() {
     fetch(`${API_URL}/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=ACTIVE`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         }
     })
     .then(response => response.text()) // Handle plain text response
     .then(text => {
         if (text === 'Bank status updated successfully') {
             showAlert('success', 'Account has been activated.');
             fetchAndDisplayAccounts(); // Refresh the account table

             const activateModal = bootstrap.Modal.getInstance(document.getElementById('activateAccountModal'));
             activateModal.hide(); // Close the modal
         } else {
             showAlert('danger', 'Failed to activate the account.');
         }
     })
     .catch(error => {
         console.error('Error activating account:', error);
         showAlert('danger', 'An error occurred while activating the account.');
     });
 }

 // Function to show alerts using SweetAlert
 function showAlert(type, message) {
     Swal.fire({
         icon: type,
         title: message,
         showConfirmButton: true,
         timer: 3000
     });
 }
    // ---------------------------- Delete API -------------------------------
    // Variable to hold the account details for deletion
    let currentDeleteAccountIdentifier = null;

    // Function to trigger the delete confirmation modal
    function deleteAccount(id, identifier) {
      currentDeleteAccountIdentifier = identifier;

      // Set the account to delete in the confirmation modal
      document.getElementById('accountToDelete').innerText = identifier;

      // Show the delete confirmation modal
      const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
      deleteModal.show();
    }

    // Function to handle the actual deletion
    function handleDelete() {
      const userEmail = sessionStorage.getItem('userEmail');
      const apiUrl = `${API_URL}/api/admin/bank/delete?email=${userEmail}&identifier=${currentDeleteAccountIdentifier}`;

      fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.text())
        .then(data => {
        if (data.includes('Bank deleted successfully')) {
          // Show success alert
          showAlert('success', 'Bank deleted successfully');
          fetchAndDisplayAccounts(); // Refresh the account table
        } else {
          // Show error alert
          showAlert('danger', 'Failed to delete the account');
        }

        // Hide the delete confirmation modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
        deleteModal.hide();
      })
        .catch(error => {
        console.error('Error deleting account:', error);
        showAlert('danger', 'An error occurred while deleting the account');
      });
    }

    // Function to setup the delete button listener
    function setupDeleteButtonListener() {
      const confirmDeleteButton = document.getElementById('confirmDeleteButton');
      if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', handleDelete);
        console.log('Delete button listener set up successfully.');
      } else {
        console.error('Confirm Delete Button not found.');
      }
    }

    // Ensure event listeners are added once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      setupDeleteButtonListener();
      fetchAndDisplayAccounts(); // Load the table when the page loads
    });

    // Function to display Bootstrap alerts
    function showAlert(type, message) {
      const alertContainer = document.getElementById('alertContainer');
      alertContainer.className = `alert alert-${type}`;
      alertContainer.textContent = message;
      alertContainer.classList.remove('d-none'); // Show the alert

      // Automatically hide the alert after 5 seconds
      setTimeout(() => {
        alertContainer.classList.add('d-none');
      }, 5000);
    }
    //---------------------------------------------Sort Active button ---------------------------
    let isFilterActive = false;

function filterActiveAccounts() {
    // Get all table rows
    const rows = document.querySelectorAll('#accountTableBody tr');
    const button = document.getElementById('toggleActiveFilter');

    rows.forEach(row => {
        // Check if the Actions column contains an "Active" button
        const actionsCell = row.querySelector('td:last-child');
        if (actionsCell) {
            const buttons = actionsCell.querySelectorAll('button');
            let showRow = false;

            // Check if there is an "Active" button
            buttons.forEach(button => {
                if (button.textContent.trim() === 'Active') {
                    showRow = true;
                }
            });

            // Show or hide the row based on the presence of the "Active" button
            if (isFilterActive) {
                row.style.display = ''; // Show the row
            } else {
                if (showRow) {
                    row.style.display = ''; // Show the row
                } else {
                    row.style.display = 'none'; // Hide the row
                }
            }
        }
    });

    // Toggle filter state and update button text
    isFilterActive = !isFilterActive;
    button.innerHTML = isFilterActive ?
        '<span class="fs-6 me-2" id="buttonText">Show All <i class="bi bi-arrow-up"></i></span>' :
        '<span class="fs-6 me-2" id="buttonText">Show Active <i class="bi bi-arrow-down"></i></span>';
}

    //---------------------------------------------Add Bank Account ---------------------------
document.addEventListener('DOMContentLoaded', function () {
  const addBankForm = document.getElementById('addBankForm');
  const addBankBtn = document.getElementById('addBankBtn');
 const addBankModal = document.getElementById('addBankModal'); // Get the modal element
  if (addBankForm && addBankBtn) {
    // Listen for the button click
    addBankBtn.addEventListener('click', async function () {
      console.log('Button clicked!'); // Check if the button click is registered

      // Retrieve email from session storage
      const email = sessionStorage.getItem('userEmail');
      if (!email) {
        console.error('Email not found in session storage.');
        showErrorModal("User email not found.");
        return;
      }

      // Gather form data
      const accountNumber = document.getElementById('accountNumber').value.trim();
      const reAccountNumber = document.getElementById('reAccountNumber').value.trim();
      const accountOwnerFullName = document.getElementById('accountOwner').value.trim();
      const address = document.getElementById('address').value.trim();
      const ifscCode = document.getElementById('ifscCode').value.trim();

      // Validate account number match
      if (accountNumber !== reAccountNumber) {
        console.error('Account numbers do not match.');
        showErrorModal("Account numbers do not match.");
        return;
      }

      // Validate required fields
      if (!accountNumber || !accountOwnerFullName || !address || !ifscCode) {
        console.error('All fields are required.');
        showErrorModal("All fields are required.");
        return;
      }

      // Create the request body
      const requestBody = new URLSearchParams({
        email: email,
        accountNumber: accountNumber,
        reEnterAccountNumber: reAccountNumber,
        accountOwnerFullName: accountOwnerFullName,
        address: address,
        ifscCode: ifscCode
      });

      console.log('Request body:', requestBody.toString()); // Debugging log

      try {
        // Send the POST request to the API
        const response = await fetch(`${API_URL}/api/admin/bank/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: requestBody
        });

        const data = await response.json();
        console.log('Response data:', data);

        // Check the response status
        if (response.ok && data.status === 'success') {
          showSuccessModal();
          addBankForm.reset(); // Reset the form after successful submission
             if(addBankModal){
                          bootstrap.Modal.getInstance(addBankModal).hide(); // Close the addUpiModal
                         }
        } else {
          // Handle API error response
          showErrorModal(data.message || "Failed to save bank details.");
        }
      } catch (error) {
        console.error('Error:', error); // Debugging log
        showErrorModal("An error occurred while saving the bank.");
      }
    });
  } else {
    console.error('addBankForm or addBankBtn element not found.');
  }

  // Show success modal
  function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Optionally, refresh the page or reload the table after closing the modal
    successModal._element.addEventListener('hidden.bs.modal', function () {
//      location.reload(); // Refresh the page after closing
  fetchAndDisplayAccounts();
    });
  }

  // Show error modal
  function showErrorModal(errorMessage) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorModalBody').innerText = errorMessage;
    errorModal.show();
  }
});
    //---------------------------------Add Upi account apis--------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
      const addUpiForm = document.getElementById('addUpiForm');
      const addUpiModal = document.getElementById('addUpiModal'); // Get the modal element


      if (addUpiForm) {
        // Listen for form submission
        addUpiForm.addEventListener('submit', async function (event) {
          event.preventDefault(); // Prevent the default form submission

          // Retrieve form inputs safely
          const upiIdInput = document.getElementById('upiId');
          const upiAccountNameInput = document.getElementById('upiAccountName');
          const upiAddressInput = document.getElementById('upiAddress');
          const upiQrCodeInput = document.getElementById('upiQrCode');

          // Ensure inputs exist before accessing their values
          if (!upiIdInput || !upiAccountNameInput || !upiAddressInput) {
            console.error('One or more input elements are missing.');
            showErrorModal("Some required fields are missing in the form.");
            return;
          }

          // Gather form data
          const upiId = upiIdInput.value.trim();
          const upiAccountName = upiAccountNameInput.value.trim();
          const upiAddress = upiAddressInput.value.trim();

          // Retrieve email from session storage
          const email = sessionStorage.getItem('userEmail');
          if (!email) {
            console.error('Email not found in session storage.');
            showErrorModal("User email not found.");
            return;
          }

          // Validate required fields
          if (!upiId || !upiAccountName || !upiAddress) {
            console.error('All required fields must be filled.');
            showErrorModal("All required fields must be filled.");
            return;
          }

          // Create FormData object
          const formData = new FormData();
          formData.append('email', email);
          formData.append('upiId', upiId);
          formData.append('upiName', upiAccountName);
          formData.append('upiProvider', 'Some UPI Provider'); // Example provider, customize as needed
          formData.append('address', upiAddress);

          // Append the QR Code file if provided
          if (upiQrCodeInput.files.length > 0) {
            formData.append('qrCodeFile', upiQrCodeInput.files[0]);
          }

          console.log('Submitting UPI form data...'); // Debugging log

          try {
            // Send the POST request to the API
            const response = await fetch(`${API_URL}/api/admin/bank/save`, {
              method: 'POST',
              body: formData
            });

            const data = await response.json();
            console.log('Response data:', data);

            // Handle API response
            if (response.ok && data.status === 'success') {
               showSuccessModal();
               addUpiForm.reset(); // Reset the form after successful submission
               if(addUpiModal){
                bootstrap.Modal.getInstance(addUpiModal).hide(); // Close the addUpiModal
               }

            } else {
              showErrorModal(data.message || "Failed to save UPI account details.");
            }
          } catch (error) {
            console.error('Error:', error); // Debugging log
            showErrorModal("An error occurred while saving the UPI account.");
          }
        });
      } else {
        console.error('addUpiForm element not found.');
      }

 function showSuccessModal() {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

    // Optionally, refresh the page or reload the table after closing the modal
    successModal._element.addEventListener('hidden.bs.modal', function () {
//      location.reload(); // Refresh the page after closing
      fetchAndDisplayAccounts();

    });
  }

     // Remove leftover backdrops when the modal is closed



    function showErrorModal(errorMessage) {
      const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

      // Show the error modal
      document.getElementById('errorModalBody').innerText = errorMessage;
      errorModal.show();

      // When the modal is hidden, remove any remaining backdrops
      errorModal._element.addEventListener('hidden.bs.modal', function () {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove(); // Remove leftover backdrop
        }
      });
    }
    });
 //   -------------------------------------Token count --------------------------------
    document.addEventListener('DOMContentLoaded', function() {
    // Fetch the user email from session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Define the API endpoint to get wallet address and phone number
        const getWalletAddressUrl = `${API_URL}/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

        // Fetch wallet address and phone number
        fetch(getWalletAddressUrl)
            .then(response => response.json())
            .then(data => {
            if (data.error) {
                console.error('Error fetching wallet address and phone number:', data.error);
            } else {
                // Extract phone number and wallet address directly from the JSON response
                const phoneNumber = data.phoneNumber;
                const walletAddress = data.walletAddress;

                if (phoneNumber && walletAddress) {
                    // Fetch token count using the phone number
                    const getTokenCountUrl = `${API_URL}/api/admin/token/count?identifier=${encodeURIComponent(phoneNumber)}`;

                    return fetch(getTokenCountUrl);
                } else {
                    console.error('Phone number or wallet address not found in the response.');
                    throw new Error('Phone number or wallet address not found');
                }
            }
        })
            .then(response => response.json())
            .then(data => {
            if (data.tokenCount !== undefined) {
                // Update the token amount in the HTML
                document.getElementById("tokenCount").textContent = data.tokenCount;
            } else {
                console.error('Error fetching token count:', data.error);
            }
        })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('User email is not found in session storage.');
    }
});
 //   -----------------------__Create Token Apis---------------------_______
document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch and update the token count
    function fetchTokenCount() {
        const userEmail = sessionStorage.getItem('userEmail');

        if (userEmail) {
            const getWalletAddressUrl = `${API_URL}/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

            fetch(getWalletAddressUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error fetching wallet address:', data.error);
                    } else {
                        const phoneNumber = data.phoneNumber;
                        const walletAddress = data.walletAddress;

                        if (phoneNumber && walletAddress) {
                            const getTokenCountUrl = `${API_URL}/api/admin/token/count?identifier=${encodeURIComponent(phoneNumber)}`;

                            return fetch(getTokenCountUrl);
                        } else {
                            console.error('Phone number or wallet address not found in the response.');
                            throw new Error('Phone number or wallet address not found');
                        }
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.tokenCount !== undefined) {
                        document.getElementById("tokenCount").textContent = data.tokenCount;
                    } else {
                        console.error('Error fetching token count:', data.error);
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            console.error('User email is not found in session storage.');
        }
    }

    // Handle the Create Tokens button click
    const createTokenButton = document.getElementById('createTokenButton');
    const inputAmount = document.getElementById('inputAmount');

    createTokenButton.addEventListener('click', function() {
        const amount = inputAmount.value;
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'User email is not set in session storage.',
                confirmButtonText: 'OK'
            });
            return;
        }

        const walletAddressUrl = `${API_URL}/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

        fetch(walletAddressUrl)
            .then(response => response.json())
            .then(data => {
                const walletAddress = data.walletAddress;

                const apiUrl = `${API_URL}/api/admin/token/create`;
                const params = new URLSearchParams();
                params.append('walletAddress', walletAddress);
                params.append('email', userEmail);
                params.append('amount', amount);

                return fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString()
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error,
                        confirmButtonText: 'OK'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: data.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Refresh the token count
                        fetchTokenCount();

                        // Reset the input field
                        inputAmount.value = '';
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while creating tokens.',
                    confirmButtonText: 'OK'
                });
                console.error('Error:', error);
            });
    });

    // Initial call to fetch token count on page load
    fetchTokenCount();
});
//---------------------------Token Rate Table --------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Fetch the token rates when the page loads
    fetchRates();

    // Function to fetch rates and populate the table
    function fetchRates() {
        const email = sessionStorage.getItem('userEmail');
        fetch(`${API_URL}/api/admin/token/viewRate?email=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(data => populateTable(data))
            .catch(error => Swal.fire('Error', 'Error fetching rates: ' + error.message, 'error'));
    }

    // Function to populate the table with fetched data
    function populateTable(data) {
        const tableBody = document.getElementById('rateTableBody');
        tableBody.innerHTML = ''; // Clear previous rows
        data.forEach((rate, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="number" class="form-control" value="${rate.minRange}" disabled></td>
                <td><input type="number" class="form-control" value="${rate.maxRange}" disabled></td>
                <td><input type="number" class="form-control" value="${rate.rate}" disabled></td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editRow(this, ${rate.id}, ${rate.minRange}, ${rate.maxRange})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRow(${rate.minRange}, ${rate.maxRange})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to enable editing of a row
    window.editRow = function (button, id, oldMinRange, oldMaxRange) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('input');
        const editMode = button.innerText === 'Edit';

        // Toggle between edit and save mode
        inputs.forEach(input => input.disabled = !editMode);
        button.innerText = editMode ? 'Save' : 'Edit';

        // If saving, call the modify API
        if (!editMode) {
            const minRange = inputs[0].value;
            const maxRange = inputs[1].value;
            const rate = inputs[2].value;
            const email = sessionStorage.getItem('userEmail');

            fetch(`${API_URL}/api/admin/token/modifyRate?email=${encodeURIComponent(email)}&newRate=${rate}&newMinRange=${minRange}&newMaxRange=${maxRange}&oldMinRange=${oldMinRange}&oldMaxRange=${oldMaxRange}`, {
                method: 'PUT'
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire('Success', 'Rate updated successfully', 'success');
                    fetchRates(); // Refresh the table
                } else {
                    response.json().then(data => Swal.fire('Error', data.message, 'error'));
                }
            })
            .catch(error => Swal.fire('Error', 'Error updating rate: ' + error.message, 'error'));
        }
    };

    // Function to delete a row
    window.deleteRow = function (minRange, maxRange) {
        const email = sessionStorage.getItem('userEmail');
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${API_URL}/api/admin/token/deleteRate?email=${encodeURIComponent(email)}&minRange=${minRange}&maxRange=${maxRange}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            Swal.fire('Deleted!', 'Rate deleted successfully', 'success');
                            fetchRates(); // Refresh the table
                        } else {
                            response.json().then(data => Swal.fire('Error', `Error deleting rate: ${data.message}`, 'error'));
                        }
                    })
                    .catch(error => Swal.fire('Error', 'Error deleting rate: ' + error.message, 'error'));
            }
        });
    };

    // Function to add a new row for input
    window.addNewRow = function () {
        const tableBody = document.getElementById('rateTableBody');
        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>#</td>
            <td><input type="number" class="form-control" placeholder="Min Range"></td>
            <td><input type="number" class="form-control" placeholder="Max Range"></td>
            <td><input type="number" class="form-control" placeholder="Rate"></td>
            <td>
                <button class="btn btn-sm btn-success" onclick="saveNewRow(this)">Save</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    };

    // Function to save the newly added row
    window.saveNewRow = function (button) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('input');
        const minRange = inputs[0].value;
        const maxRange = inputs[1].value;
        const rate = inputs[2].value;
        const email = sessionStorage.getItem('userEmail');

        // Call the create API
        fetch(`${API_URL}/api/admin/token/createRate?email=${encodeURIComponent(email)}&rate=${rate}&minRange=${minRange}&maxRange=${maxRange}`, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                Swal.fire('Success', 'Rate created successfully', 'success');
                fetchRates(); // Refresh the table
            } else {
                response.json().then(data => Swal.fire('Error', `Error creating rate: ${data.message}`, 'error'));
            }
        })
        .catch(error => Swal.fire('Error', 'Error creating rate: ' + error.message, 'error'));
    };
});

 //---------------------------------- Toggle nav bar  ----------------------------------

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
     * Easy on scroll event listener
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function(e) {
            select('body').classList.toggle('toggle-sidebar')
        })
    }

    /**
     * Search bar toggle
     */
    if (select('.search-bar-toggle')) {
        on('click', '.search-bar-toggle', function(e) {
            select('.search-bar').classList.toggle('search-bar-show')
        })
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true)
    const navbarlinksActive = () => {
        let position = window.scrollY + 200
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return
            let section = select(navbarlink.hash)
            if (!section) return
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active')
            } else {
                navbarlink.classList.remove('active')
            }
        })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
     * Toggle .header-scrolled class to #header when page is scrolled
     */
    let selectHeader = select('#header')
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add('header-scrolled')
            } else {
                selectHeader.classList.remove('header-scrolled')
            }
        }
        window.addEventListener('load', headerScrolled)
        onscroll(document, headerScrolled)
    }

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
    }

    /**
     * Initiate tooltips
     */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    /**
     * Initiate quill editors
     */
    if (select('.quill-editor-default')) {
        new Quill('.quill-editor-default', {
            theme: 'snow'
        });
    }

    if (select('.quill-editor-bubble')) {
        new Quill('.quill-editor-bubble', {
            theme: 'bubble'
        });
    }

    if (select('.quill-editor-full')) {
        new Quill(".quill-editor-full", {
            modules: {
                toolbar: [
                    [{
                        font: []
                    }, {
                        size: []
                    }],
                    ["bold", "italic", "underline", "strike"],
                    [{
                        color: []
                    },
                        {
                            background: []
                        }
                    ],
                    [{
                        script: "super"
                    },
                        {
                            script: "sub"
                        }
                    ],
                    [{
                        list: "ordered"
                    },
                        {
                            list: "bullet"
                        },
                        {
                            indent: "-1"
                        },
                        {
                            indent: "+1"
                        }
                    ],
                    ["direction", {
                        align: []
                    }],
                    ["link", "image", "video"],
                    ["clean"]
                ]
            },
            theme: "snow"
        });
    }

    /**
     * Initiate TinyMCE Editor
     */

    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

    tinymce.init({
        selector: 'textarea.tinymce-editor',
        plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
        editimage_cors_hosts: ['picsum.photos'],
        menubar: 'file edit view insert format tools table help',
        toolbar: "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        link_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
            {
                title: 'My page 2',
                value: 'http://www.moxiecode.com'
            }
        ],
        image_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
            {
                title: 'My page 2',
                value: 'http://www.moxiecode.com'
            }
        ],
        image_class_list: [{
            title: 'None',
            value: ''
        },
            {
                title: 'Some class',
                value: 'class-name'
            }
        ],
        importcss_append: true,
        file_picker_callback: (callback, value, meta) => {
            /* Provide file and text for the link dialog */
            if (meta.filetype === 'file') {
                callback('https://www.google.com/logos/google.jpg', {
                    text: 'My text'
                });
            }

            /* Provide image and alt text for the image dialog */
            if (meta.filetype === 'image') {
                callback('https://www.google.com/logos/google.jpg', {
                    alt: 'My alt text'
                });
            }

            /* Provide alternative source and posted for the media dialog */
            if (meta.filetype === 'media') {
                callback('movie.mp4', {
                    source2: 'alt.ogg',
                    poster: 'https://www.google.com/logos/google.jpg'
                });
            }
        },
        height: 600,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
    });

    /**
     * Initiate Bootstrap validation check
     */
    var needsValidation = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(needsValidation)
        .forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })

    /**
     * Initiate Datatables
     */
    const datatables = select('.datatable', true)
    datatables.forEach(datatable => {
        new simpleDatatables.DataTable(datatable, {
            perPageSelect: [5, 10, 15, ["All", -1]],
            columns: [{
                select: 2,
                sortSequence: ["desc", "asc"]
            },
                {
                    select: 3,
                    sortSequence: ["desc"]
                },
                {
                    select: 4,
                    cellClass: "green",
                    headerClass: "red"
                }
            ]
        });
    })

    /**
     * Autoresize echart charts
     */
    const mainContainer = select('#main');
    if (mainContainer) {
        setTimeout(() => {
            new ResizeObserver(function() {
                select('.echart', true).forEach(getEchart => {
                    echarts.getInstanceByDom(getEchart).resize();
                })
            }).observe(mainContainer);
        }, 200);
    }

})();
//-------------------------------------------------------
