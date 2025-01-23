//const isLocal = false;
//const API_BASE_URL = 'https://selfidcard.in:8443';
//const API_LOCAL_URL = 'http://localhost:8001';
//const API_URL = isLocal ? API_LOCAL_URL : API_BASE_URL;

// Global variables
const userEmail = sessionStorage.getItem('userEmail');
let selectedAccountId = null;
let currentIdentifier = '';
let currentName = '';
let selectedIdentifier = '';
let currentDeleteAccountIdentifier = null;
let isFilterActive = false;


// Ensure DOM is fully loaded before executing main script
document.addEventListener('DOMContentLoaded', () => {
    // Setup initial data fetching
    fetchUserInfo(userEmail);
    fetchAndDisplayTransactions();
    fetchUserName();
    fetchAndDisplayAccounts();
//    fetchRates();
    setupDeleteButtonListener();
    setupModalCloseTimeouts();
});


//-------------------------------------- Helper Functions -------------------------------------------
function handleResponseError(response) {
    if (!response.ok) {
        return response.json().then(errorData => {
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        });
    }
    return response;
}


function showModal(modalId, duration = 2000) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
    if(duration){
       setTimeout(() => {
           modal.hide();
       }, duration);
    }
}

function setupModalCloseTimeouts() {
    ['successModal', 'errorModal'].forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if(modalElement){
          modalElement.addEventListener('shown.bs.modal', () => {
                setTimeout(() => {
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                }, modalId === 'successModal' ? 1500 : 3000);
            });
        }
    });
}

function showErrorModal(message) {
    document.getElementById('errorModalBody').textContent = message;
    showModal('errorModal');
}

function showSuccessModal() {
    showModal('successModal');
}
// Move the closeModal function outside of the DOMContentLoaded event
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function showAlert(type, message) {
    Swal.fire({
        icon: type,
        title: message,
        showConfirmButton: true,
        timer: 3000
    });
}

//-------------------------------------- User Info API -------------------------------------------
function fetchUserInfo(email) {
    if (!email) {
        alert('You are on a guest profile');
        return;
    }
    const apiUrl = `${API_URL}/api/admin/distributor/userInfo?email=${email}`;
    fetch(apiUrl)
        .then(handleResponseError)
        .then(response => response.json())
        .then(data => {
            document.getElementById("userRole").innerText = data.role || "N/A";
        })
        .catch(error => {
            console.error("Error fetching user info:", error);
            alert("An error occurred while fetching user information.");
        });
}

//-------------------------------------- Transaction Status Table API -------------------------------------------
function fetchAndDisplayTransactions() {
  const transactionTableBody = document.getElementById('transactionTableBody');
  const searchInput = document.getElementById('searchTransactionId');

  fetch(`${API_URL}/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}&userEmail=${userEmail}`)
    .then(handleResponseError)
    .then(response => response.json())
    .then(data => {
      transactionTableBody.innerHTML = ''; // Clear the table body

        // Filter the data based on search input
        const filteredData = data.filter(transaction =>
          !searchInput.value || transaction.transactionId.includes(searchInput.value)
        );

      filteredData.forEach((transaction, index) => {
         let type = transaction.userEmail === userEmail ? 'Request Sent' :
             transaction.creatorEmail === userEmail ? 'Request Received' : '';
        const date = new Date(transaction.timestamp).toLocaleDateString();
         let statusImage = '';
         switch (transaction.status) {
             case 'Pending': statusImage = 'assets/img/pending.png'; break;
             case 'Rejected': statusImage = 'assets/img/rejected.png'; break;
             case 'Accepted': statusImage = 'assets/img/success.png'; break;
             default: statusImage = 'assets/img/default.png';
         }


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


// Function to update transaction status
window.updateStatus = function (transactionId, status) {
  fetch(`${API_URL}/api/admin/distributor/updateTransactionStatus?transactionId=${transactionId}&status=${status}`, {
    method: 'POST'
  })
      .then(handleResponseError)
      .then(response => response.json())
      .then(data => {
        if (data.message) {
            showAlert('success', `Transaction ${status.toLowerCase()} successfully!`);
             fetchAndDisplayTransactions();
        } else {
            showAlert('error', data.error || 'An error occurred');
        }
      })
      .catch(error => {
         showAlert('error', 'An error occurred while updating the status');
          console.error('Error:', error);
      });
};

// Function to fetch token amount
function fetchTokenAmount(transactionId) {
    return fetch(`${API_URL}/api/admin/tokenAmount/viewByTransactionId?transactionId=${transactionId}`)
        .then(handleResponseError)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                return data[0].tokenAmount;
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
            });
        })
        .then(handleResponseError)
        .then(response => response.json())
        .then(statusData => {
            if (!statusData.message) {
                throw new Error(statusData.error || 'An error occurred while updating the status');
            }
            return fetch(`${API_URL}/api/admin/token/send?senderIdentifier=${userEmail}&amount=${tokenAmount}&recipient=${recipientEmail}`, {
                method: 'POST'
            });
        })
      .then(handleResponseError)
        .then(response => response.json())
        .then(tokenData => {
            if (tokenData.message) {
                showAlert('success', 'Token sent successfully!');
                fetchAndDisplayTransactions();
            } else {
               showAlert('error', tokenData.error || 'An error occurred while sending the token');
            }
        })
        .catch(error => {
            showAlert('error', error.message || 'An error occurred');
             console.error('Error:', error);
        });
};

// Refresh button event listener
document.getElementById('refreshButton').addEventListener('click', fetchAndDisplayTransactions);

// Search input event listener
document.getElementById('searchTransactionId').addEventListener('input', fetchAndDisplayTransactions);


//-------------------------------------- Create Transaction Request API -------------------------------------------
 //  ------------------------------Create transection request api------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const doneButton = document.getElementById("bankDoneButton1");
  const doneButton1 = document.getElementById("upiDoneButton1");

  let isBankAccountAvailable = false;
  let isUPIAccountAvailable = false;

  // Function to update the flags based on account availability
  function checkAccountAvailability() {
    isBankAccountAvailable = document.getElementById("bankAccountsContainer").innerHTML.trim() !== "<p>No Active Bank Account Available. Please Select Another Option.</p>";
    isUPIAccountAvailable = document.getElementById("upiAccountsContainer").innerHTML.trim() !== "<p>No Active UPI Account Available. Please Select Another Option.</p>";
  }

  // Bank Transfer Done Button
  doneButton.addEventListener("click", function() {
    checkAccountAvailability(); // Ensure flags are updated before validation

    const transactionID = document.getElementById("bankTransactionID1").value;
    const amount = document.getElementById("payableAmount").textContent.match(/\d+/)[0];
    const email = sessionStorage.getItem('userEmail');
    const tokenAmount = document.getElementById('inputTokenAmount').value;

    if (!isBankAccountAvailable) {
      alert("Cannot create request as no bank account is selected.");
      return;
    }
    if (!transactionID) {
      alert("Please enter the transaction ID.");
      return;
    }

    fetch(`${API_URL}/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        showAlert("Payment request submitted successfully.");
        closeModal('bankTransferModal1');

        fetch(`${API_URL}/api/admin/tokenAmount/create?transactionId=${transactionID}&email=${email}&tokenAmount=${tokenAmount}&price=${amount}`, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data) {
            console.log("Token amount record created successfully", data);
          } else {
            console.log("Error: ", data);
          }
        })
        .catch(error => {
          console.error("Error creating token amount:", error);
        });
      } else {
        showAlert("Error: " + (data.error || "Unknown error"));
      }
    })
    .catch(error => {
      showAlert("Error: " + error.message);
    });
  });

  // UPI Payment Done Button
  doneButton1.addEventListener("click", function() {
    checkAccountAvailability(); // Ensure flags are updated before validation

    const transactionID = document.getElementById("upiTransactionID1").value;
    const amount = document.getElementById("payableAmount").textContent.match(/\d+/)[0];
    const email = sessionStorage.getItem('userEmail');
    const tokenAmount = document.getElementById('inputTokenAmount').value;

    if (!isUPIAccountAvailable) {
      alert("Cannot create request as no UPI account is selected.");
      return;
    }
    if (!transactionID) {
      alert("Please enter the transaction ID.");
      return;
    }

    fetch(`${API_URL}/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        showAlert("Payment request submitted successfully.");
        closeModal('upiModal1');

        fetch(`${API_URL}/api/admin/tokenAmount/create?transactionId=${transactionID}&email=${email}&tokenAmount=${tokenAmount}&price=${amount}`, {
          method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
          if (data) {
            console.log("Token amount record created successfully", data);
          } else {
            console.log("Error: ", data);
          }
        })
        .catch(error => {
          console.error("Error creating token amount:", error);
        });
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
    if (alert && alertMessage) {
      alertMessage.textContent = message;
      alert.classList.remove("d-none");
    } else {
      console.error("Alert elements not found in the DOM");
    }
  }
});
//-------------------------------------- User Name API -------------------------------------------
function fetchUserName() {
   if (userEmail) {
     fetch(`${API_URL}/api/admin/distributor/name?email=${encodeURIComponent(userEmail)}`)
        .then(handleResponseError)
        .then(response => response.json())
        .then(data => {
             const userName = data.name || 'Guest';
             document.querySelector('.nav-profile .dropdown-toggle').textContent = userName;
             document.querySelector('.dropdown-header h6').textContent = userName;
        })
        .catch(error => {
           console.error('Error fetching name:', error);
           document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
           document.querySelector('.dropdown-header h6').textContent = 'Guest';
       });
    } else {
        console.error('No email found in session.');
       document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
       document.querySelector('.dropdown-header h6').textContent = 'Guest';
    }
}


//-------------------------------------- Logout API -------------------------------------------
document.getElementById('logoutBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default link behavior
    sessionStorage.clear(); // Clear session storage
    window.location.href = './login.html'; // Redirect to login page
});

//-------------------------------------- Token Calculation  & Generate QR Code Function  -------------------------------------------
function handleTokenInput() {
   const tokenAmount = document.getElementById("inputTokenAmount").value;
   if (!tokenAmount || tokenAmount <= 0) {
        document.getElementById("rateDisplay").textContent = "Please enter a valid token amount";
        document.getElementById("payableAmount").textContent = "";
       return;
   }
   fetch(`${API_URL}/api/admin/distributor/userInfo?email=${userEmail}`)
        .then(handleResponseError)
       .then(response => response.json())
       .then(userInfo => {
            const creatorEmail = userInfo.creatorEmail;
            fetch(`${API_URL}/api/admin/token/viewRate?email=${creatorEmail}`)
              .then(handleResponseError)
               .then(response => response.json())
                .then(rates => {
                    let applicableRate = null;
                    let highestRate = null;
                    let highestMaxRange = -Infinity;
                     rates.forEach(rateInfo => {
                        if (tokenAmount >= rateInfo.minRange && tokenAmount <= rateInfo.maxRange) {
                           applicableRate = rateInfo.rate;
                         }
                        if (rateInfo.maxRange > highestMaxRange) {
                           highestMaxRange = rateInfo.maxRange;
                            highestRate = rateInfo.rate;
                         }
                    });

                    if (applicableRate === null && tokenAmount > highestMaxRange) {
                         applicableRate = highestRate;
                    }

                    if (applicableRate !== null) {
                        const payableAmount = tokenAmount * applicableRate;
                        document.getElementById("rateDisplay").textContent = `Rate: ₹${applicableRate} per token`;
                       document.getElementById("payableAmount").textContent = `Total Payable Amount: ₹${payableAmount}`;
                  } else {
                     document.getElementById("rateDisplay").textContent = "No applicable rate found for the entered token amount";
                        document.getElementById("payableAmount").textContent = "";
                    }
              })
                .catch(error => {
                   console.error('Error fetching rate:', error);
                     alert('Failed to fetch token rates.');
                });
       })
        .catch(error => {
          console.error('Error fetching user info:', error);
          alert('Failed to fetch distributor user info.');
        });
}


function handlePayment() {
  const paymentMethod = document.getElementById("paymentMethod").value;
  const selectedPlan = document.getElementById("payableAmount").textContent.match(/\d+/)[0];
  const tokens = document.getElementById("inputTokenAmount").value;
   if (!paymentMethod) {
       alert("Please select a payment method.");
        return;
    }

  fetch(`${API_URL}/api/admin/distributor/userInfo?email=${userEmail}`)
     .then(handleResponseError)
       .then(response => response.json())
        .then(userInfo => {
           const creatorEmail = userInfo.creatorEmail;

            fetch(`${API_URL}/api/admin/bank/view?email=${creatorEmail}`)
                .then(handleResponseError)
                .then(response => response.json())
               .then(data => {
                    const activeAccounts = data.filter(account => account.status.toUpperCase() === 'ACTIVE');

                   if (paymentMethod === 'BankTransfer') {
                        const bankAccounts = activeAccounts.filter(account => /^[0-9]+$/.test(account.identifier) && account.type === 'Bank Account');

                        document.getElementById("bankAccountsContainer").innerHTML = "";

                        if (bankAccounts.length > 0) {
                            bankAccounts.forEach(account => {
                              const accountHtml = `
                                  <div class="account-details mb-4">
                                   <p class="fw-bold">Please Pay ₹${selectedPlan} for ${tokens} Tokens Request on this Account</p>
                                      <p class="fw-bold">Name: ${account.name}</p>
                                       <p class="fw-bold">Account Number: ${account.identifier}</p>
                                       <p class="fw-bold">IFSC Code: ${account.ifscCode || 'N/A'}</p>
                                  </div>
                                `;
                              document.getElementById("bankAccountsContainer").innerHTML += accountHtml;
                         });
                           openModal('bankTransferModal1');
                        } else {
                          document.getElementById("bankAccountsContainer").innerHTML = "<p>No Active Bank Account Available. Please Select Another Option.</p>";
                           openModal('bankTransferModal1');
                      }
                  } else if (paymentMethod === 'UPI') {
                       const upiAccounts = activeAccounts.filter(account => account.identifier.includes('@') && account.type === 'UPI Account');
                      document.getElementById("upiAccountsContainer").innerHTML = "";
                      if (upiAccounts.length > 0) {
                            upiAccounts.forEach(account => {
                              const { identifier } = account;
                               const upiLink = `upi://pay?pa=${encodeURIComponent(identifier)}&am=${selectedPlan}&cu=INR`;
                               const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=150x150`;
                               const accountHtml = `
                                  <div class="account-details mb-4">
                                      <p class="fw-bold">Please Pay ₹${selectedPlan} for ${tokens} Tokens Request on this Account</p>
                                        <p class="fw-bold">Name: ${account.name}</p>
                                        <p class="fw-bold">UPI ID: ${identifier}</p>
                                        <div class="d-flex justify-content-center mb-4">
                                          <img src="${qrCodeUrl}" alt="QR Code for ${identifier}">
                                        </div>
                                  </div>
                                `;
                              document.getElementById("upiAccountsContainer").innerHTML += accountHtml;
                         });
                          openModal('upiModal1');
                      } else {
                           document.getElementById("upiAccountsContainer").innerHTML = "<p>No Active UPI Account Available. Please Select Another Option.</p>";
                            openModal('upiModal1');
                     }
                  }
               })
               .catch(error => {
                    console.error('Error fetching accounts:', error);
                    alert('Failed to fetch payment accounts.');
               });
        })
        .catch(error => {
           console.error('Error fetching user info:', error);
             alert('Failed to fetch distributor user info.');
       });
}


function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

//--------------------------------------Account APi -------------------------------------------

 function fetchAndDisplayAccounts() {
    fetch(`${API_URL}/api/admin/bank/view?email=${userEmail}`)
        .then(handleResponseError)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('accountTableBody');
            tableBody.innerHTML = '';

            data.forEach(account => {
                const row = document.createElement('tr');
                const accountType = account.identifier
                    ? account.identifier.includes('@') ? 'UPI Account' : 'Bank Account'
                    : 'Unknown';
                const identifier = account.identifier || 'N/A';
                const name = account.name || 'N/A';
                const status = account.status || 'N/A';
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
// --------------------------------------Edit Modal-------------------------------------------
function openEditModal(id, identifier, name) {
    selectedAccountId = id;
    currentIdentifier = identifier;
    currentName = name;
    document.getElementById('editIdentifier').value = identifier;
    document.getElementById('editName').value = name;
    showModal('editAccountModal',null);
}

function saveChanges() {
    const newIdentifier = document.getElementById('editIdentifier').value;
    const newName = document.getElementById('editName').value;
    const changeIdentifier = newIdentifier !== currentIdentifier ? newIdentifier : '';
    const changeName = newName !== currentName ? newName : '';
    if (!changeIdentifier && !changeName) {
         showAlert('warning', 'No changes were made.');
        return;
    }
     let apiUrl = `${API_URL}/api/admin/bank/modify?email=${userEmail}&identifier=${currentIdentifier}`;
     if (changeIdentifier) {
         apiUrl += `&changeIdentifier=${encodeURIComponent(changeIdentifier)}`;
     }
     if (changeName) {
         apiUrl += `&changeName=${encodeURIComponent(changeName)}`;
     }
    fetch(apiUrl, {
        method: 'PUT',
    })
        .then(handleResponseError)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                  let successMessage = '';
                  if (changeIdentifier && changeName) {
                      successMessage = 'Identifier and Name have been successfully changed.';
                  } else if (changeIdentifier) {
                      successMessage = 'Identifier has been successfully changed.';
                  } else if (changeName) {
                      successMessage = 'Name has been successfully changed.';
                  }
                showAlert('success', successMessage);
                fetchAndDisplayAccounts();
                 showModal('editAccountModal', null);
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
                editModal.hide();
            } else {
               showAlert('danger', 'Failed to modify the account.');
            }
        })
       .catch(error => {
           console.error('Error modifying account:', error);
            showAlert('danger', 'An error occurred while modifying the account.');
       });
}
// --------------------------------------Deactivate Modal-------------------------------------------
function openDeactivateModal(identifier) {
    selectedIdentifier = identifier;
    showModal('deactivateModal',null);
}

function deactivateAccount() {
    fetch(`${API_URL}/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=DEACTIVE`, {
        method: 'POST',
    })
     .then(handleResponseError)
        .then(response => response.text())
      .then(text => {
        if (text === 'Bank status updated successfully') {
           showAlert('success', 'Account has been deactivated.');
             fetchAndDisplayAccounts();

        } else {
            showAlert('danger', 'Failed to deactivate the account.');
        }
      })
        .finally(() => {
           const deactivateModal = bootstrap.Modal.getInstance(document.getElementById('deactivateModal'));
            if(deactivateModal){
                 deactivateModal.hide();
              }
        })
      .catch(error => {
          console.error('Error deactivating account:', error);
          showAlert('danger', 'An error occurred while deactivating the account.');
      });
}
// --------------------------------------Activate Modal-------------------------------------------
function openActivateModal(identifier) {
    selectedIdentifier = identifier;
    showModal('activateAccountModal',null)
}

function activateAccount() {
    fetch(`${API_URL}/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=ACTIVE`, {
        method: 'POST',
    })
        .then(handleResponseError)
        .then(response => response.text())
      .then(text => {
        if (text === 'Bank status updated successfully') {
            showAlert('success', 'Account has been activated.');
            fetchAndDisplayAccounts();

        } else {
            showAlert('danger', 'Failed to activate the account.');
        }
      })
       .finally(() => {
           const activateModal = bootstrap.Modal.getInstance(document.getElementById('activateAccountModal'));
            if(activateModal){
                 activateModal.hide();
             }
       })
      .catch(error => {
          console.error('Error activating account:', error);
           showAlert('danger', 'An error occurred while activating the account.');
      });
}
 // ---------------------------- Delete API -------------------------------
function deleteAccount(id, identifier) {
    currentDeleteAccountIdentifier = identifier;
    document.getElementById('accountToDelete').innerText = identifier;
     showModal('deleteConfirmationModal',null);
}

function handleDelete() {
    fetch(`${API_URL}/api/admin/bank/delete?email=${userEmail}&identifier=${currentDeleteAccountIdentifier}`, {
        method: 'DELETE',
    })
    .then(handleResponseError)
    .then(response => response.text())
        .then(data => {
            if (data.includes('Bank deleted successfully')) {
                showAlert('success', 'Bank deleted successfully');
                fetchAndDisplayAccounts();
                 showModal('deleteConfirmationModal', null);
            } else {
               showAlert('danger', 'Failed to delete the account');
            }
        })
        .catch(error => {
             console.error('Error deleting account:', error);
              showAlert('danger', 'An error occurred while deleting the account');
        });
}

function setupDeleteButtonListener() {
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', handleDelete);
    } else {
      console.error('Confirm Delete Button not found.');
    }
}

// ---------------------------- Filter Logic -------------------------------
function filterActiveAccounts() {
    const rows = document.querySelectorAll('#accountTableBody tr');
    const button = document.getElementById('toggleActiveFilter');

    rows.forEach(row => {
        const actionsCell = row.querySelector('td:last-child');
        if (actionsCell) {
            const buttons = actionsCell.querySelectorAll('button');
            const showRow = Array.from(buttons).some(btn => btn.textContent.trim() === 'Active');
            row.style.display = isFilterActive || showRow ? '' : 'none';
        }
    });

    isFilterActive = !isFilterActive;
    button.innerHTML = isFilterActive ?
        '<span class="fs-6 me-2" id="buttonText">Show All <i class="bi bi-arrow-up"></i></span>' :
        '<span class="fs-6 me-2" id="buttonText">Show Active <i class="bi bi-arrow-down"></i></span>';
}


//---------------------------------------------Add Bank Account ---------------------------
   document.getElementById('addBankBtn').addEventListener('click', function() {
           const bankName = document.getElementById('bankName').value;
           const accountNumber = document.getElementById('accountNumber').value;
           const reAccountNumber = document.getElementById('reAccountNumber').value;
           const accountOwnerFullName = document.getElementById('accountOwner').value;
           const address = document.getElementById('address').value;
           const ifscCode = document.getElementById('ifscCode').value;

           if (accountNumber !== reAccountNumber) {
               showErrorModal('Account numbers do not match.');
               return;
           }
           fetch(`${API_URL}/api/admin/bank/save`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: new URLSearchParams({
                   email: userEmail,
                   accountNumber: accountNumber,
                   reEnterAccountNumber: reAccountNumber,
                   accountOwnerFullName: accountOwnerFullName,
                   address: address,
                   ifscCode: ifscCode,
               }),
           })
               .then(handleResponseError)
               .then(response => response.json())
               .then(() => {
                  showSuccessModal();
                    const addBankModal = bootstrap.Modal.getInstance(document.getElementById('addBankModal'));
                   if(addBankModal){
                        addBankModal.hide();
                     }
                  fetchAndDisplayAccounts();
               })
               .catch(error => {
                                      const addUpiModal = bootstrap.Modal.getInstance(document.getElementById('addBankModal'));
                                     if(addUpiModal){
                                          addUpiModal.hide();
                                       }
                                     showErrorModal(error.message);
                                 });
       });


   //--------------------------------------Add UPI Account Logic-------------------------------------------
       document.getElementById('addUpiForm').addEventListener('submit', function(event) {
               event.preventDefault();
               const upiId = document.getElementById('upiId').value;
               const upiAccountName = document.getElementById('upiAccountName').value;
               const upiAddress = document.getElementById('upiAddress').value;
               const qrCodeFile = document.getElementById('upiQrCode').files[0];
               const formData = new FormData();
               formData.append('email', userEmail);
               formData.append('upiId', upiId);
               formData.append('upiName', upiAccountName);
               formData.append('upiProvider', upiAddress);
               if(qrCodeFile){
                   formData.append('qrCodeFile', qrCodeFile);
               }
               fetch(`${API_URL}/api/admin/bank/save`, {
                   method: 'POST',
                   body: formData,
               })
                   .then(handleResponseError)
                   .then(response => response.json())
                   .then(() => {
                       showSuccessModal();
                         const addUpiModal = bootstrap.Modal.getInstance(document.getElementById('addUpiModal'));
                       if(addUpiModal){
                            addUpiModal.hide();
                         }
                       fetchAndDisplayAccounts();
                   })
                   .catch(error => {
                        const addUpiModal = bootstrap.Modal.getInstance(document.getElementById('addUpiModal'));
                       if(addUpiModal){
                            addUpiModal.hide();
                         }
                       showErrorModal(error.message);
                   });
           });
  //---------------------------------- Token Rate Table Functionalities ----------------------------------
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
