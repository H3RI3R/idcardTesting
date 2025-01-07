
//  ------------------------------table api of status ------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const transactionTableBody = document.getElementById("transactionTableBody");
  const searchTransactionId = document.getElementById("searchTransactionId");
  const refreshButton = document.getElementById("refreshButton");
  const userEmail = sessionStorage.getItem('userEmail');

  function fetchTransactionRequests() {
    fetch(`/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}`)
      .then(response => response.json())
      .then(data => {
      displayTransactions(data);
    })
      .catch(error => {
      console.error('Error fetching transaction requests:', error);
    });
  }

  function displayTransactions(transactions) {
    transactionTableBody.innerHTML = ''; // Clear the table body

    transactions.forEach((transaction, index) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const amount = Math.round(transaction.amount);
      const statusImage = getStatusImage(transaction.status);
      const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${date}</td>
                <td>${amount}</td>
                <td><img src="${statusImage}" alt="${transaction.status}" width="60" height="30"></td> <!-- Adjusted size -->
                <td>${transaction.transactionId}</td>
            </tr>
        `;
      transactionTableBody.insertAdjacentHTML('beforeend', row);
    });
  }

  function getStatusImage(status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'assets/img/pending.png';
      case 'rejected':
        return 'assets/img/rejected.png';
      case 'accepted':
        return 'assets/img/success.png';
      default:
        return '';
    }
  }

  // Search functionality
  searchTransactionId.addEventListener("input", function() {
    const filter = searchTransactionId.value.toLowerCase();
    const rows = transactionTableBody.getElementsByTagName("tr");

    Array.from(rows).forEach(row => {
      const transactionId = row.cells[4].textContent.toLowerCase();
      if (transactionId.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // Refresh button functionality
  refreshButton.addEventListener("click", function() {
    fetchTransactionRequests();
  });

  // Initial fetch
  fetchTransactionRequests();
});
//  ------------------------------Create transection request api------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const doneButton = document.getElementById("bankDoneButton1");
  const doneButton1 = document.getElementById("upiDoneButton1");

  let isBankAccountAvailable = false;
  let isUPIAccountAvailable = false;

  // Function to update the flags based on account availability
  function checkAccountAvailability() {
    isBankAccountAvailable = document.getElementById("bankAccountsContainer").innerHTML.trim() !== "<p>No Active Bank Account Available. Please Select Another Option.</p>";
    isUPIAccountAvailable = document.getElementById("upiAccountsContainer").innerHTML.trim() !== "<p>No Active UPI Account Available. Please Select Another Option.</p>";
  }

  // Function to check if the transaction ID is unique
  function isTransactionIdUnique(transactionID, callback) {
    const creatorEmail = sessionStorage.getItem('userEmail');
    fetch(`/api/admin/distributor/getTransactionRequests?creatorEmail=${creatorEmail}`)
      .then(response => response.json())
      .then(data => {
        const transactionExists = data.some(request => request.transactionId === transactionID);
        callback(!transactionExists); // Pass true if unique, false otherwise
      })
      .catch(error => {
        console.error("Error fetching transaction requests:", error);
        showAlert("Error fetching existing requests. Please try again.");
      });
  }

  // Bank Transfer Done Button
  doneButton.addEventListener("click", function () {
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

    // Check if transaction ID is unique
    isTransactionIdUnique(transactionID, function (isUnique) {
      if (!isUnique) {
        swal("Error", "This transaction ID request already exists.", "error");
        return;
      }

      // Proceed with request if transaction ID is unique
      fetch(`/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            showAlert("Payment request submitted successfully.");
            closeModal('bankTransferModal1');

            fetch(`/api/admin/tokenAmount/create?transactionId=${transactionID}&email=${email}&tokenAmount=${tokenAmount}&price=${amount}`, {
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
  });

  // UPI Payment Done Button
  doneButton1.addEventListener("click", function () {
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

    // Check if transaction ID is unique
    isTransactionIdUnique(transactionID, function (isUnique) {
      if (!isUnique) {
        swal("Error", "This transaction ID request already exists.", "error");
        return;
      }

      // Proceed with request if transaction ID is unique
      fetch(`/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            showAlert("Payment request submitted successfully.");
            closeModal('upiModal1');

            fetch(`/api/admin/tokenAmount/create?transactionId=${transactionID}&email=${email}&tokenAmount=${tokenAmount}&price=${amount}`, {
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
  });

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

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
 // Function to handle token input and display the rate and payable amount
 function handleTokenInput() {
   const tokenAmount = document.getElementById("inputTokenAmount").value;
   const userEmail = sessionStorage.getItem("userEmail");

   if (!tokenAmount || tokenAmount <= 0) {
     document.getElementById("rateDisplay").textContent = "Please enter a valid token amount";
     document.getElementById("payableAmount").textContent = "";
     return;
   }

   // Fetch distributor user information to get the creator's email
   fetch(`/api/admin/distributor/userInfo?email=${userEmail}`)
     .then(response => response.json())
     .then(userInfo => {
       const creatorEmail = userInfo.creatorEmail;

       // Fetch the rate based on the creator's email
       fetch(`/api/admin/token/viewRate?email=${creatorEmail}`)
         .then(response => response.json())
         .then(rates => {
           let applicableRate = null;
           let highestRate = null;
           let highestMaxRange = -Infinity;

           // Loop through rates to find the applicable rate and the highest rate
           rates.forEach(rateInfo => {
             // Find the applicable rate based on the token amount
             if (tokenAmount >= rateInfo.minRange && tokenAmount <= rateInfo.maxRange) {
               applicableRate = rateInfo.rate;
             }

             // Keep track of the highest rate and maxRange
             if (rateInfo.maxRange > highestMaxRange) {
               highestMaxRange = rateInfo.maxRange;
               highestRate = rateInfo.rate;
             }
           });

           // If no applicable rate is found, use the highest available rate
           if (applicableRate === null && tokenAmount > highestMaxRange) {
             applicableRate = highestRate;
           }

           if (applicableRate !== null) {
             // Calculate the payable amount
             const payableAmount = tokenAmount * applicableRate;

             // Display the rate and payable amount
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

 // Function to handle payment method and show appropriate modal
 function handlePayment() {
   const userEmail = sessionStorage.getItem("userEmail");
   const paymentMethod = document.getElementById("paymentMethod").value;
   const selectedPlan = document.getElementById("payableAmount").textContent.match(/\d+/)[0]; // Extract amount from Payable Amount text
   const tokens = document.getElementById("inputTokenAmount").value;

   if (!paymentMethod) {
     alert("Please select a payment method.");
     return;
   }

   // Fetch the distributor user information to get the creator's email
   fetch(`/api/admin/distributor/userInfo?email=${userEmail}`)
     .then(response => response.json())
     .then(userInfo => {
       const creatorEmail = userInfo.creatorEmail;

       // Fetch the bank/UPI accounts using the creator's email
       fetch(`/api/admin/bank/view?email=${creatorEmail}`)
         .then(response => response.json())
         .then(data => {
           // Filter accounts based on selected payment method and active status
           const activeAccounts = data.filter(account => account.status.toUpperCase() === 'ACTIVE');

           if (paymentMethod === 'BankTransfer') {
             // Filter for active bank accounts
             const bankAccounts = activeAccounts.filter(account => /^[0-9]+$/.test(account.identifier) && account.type === 'Bank Account');

             // Clear previous content
             document.getElementById("bankAccountsContainer").innerHTML = "";

             if (bankAccounts.length > 0) {
               // Display all active bank accounts
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
               // Show Bank Transfer Modal
               openModal('bankTransferModal1');
             } else {
               // Show message when no active bank accounts are available
               document.getElementById("bankAccountsContainer").innerHTML = "<p>No Active Bank Account Available. Please Select Another Option.</p>";
               openModal('bankTransferModal1');
             }
           } else if (paymentMethod === 'UPI') {
             // Filter for active UPI accounts
             const upiAccounts = activeAccounts.filter(account => account.identifier.includes('@') && account.type === 'UPI Account');

             // Clear previous content
             document.getElementById("upiAccountsContainer").innerHTML = "";

             if (upiAccounts.length > 0) {
               // Display all active UPI accounts
               upiAccounts.forEach(account => {
                 const { identifier } = account;

                 // Generate UPI payment link
                 const upiLink = `upi://pay?pa=${encodeURIComponent(identifier)}&am=${selectedPlan}&cu=INR`;

                 // Create QR Code
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
               // Show UPI Modal
               openModal('upiModal1');
             } else {
               // Show message when no active UPI accounts are available
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

 // Function to open a modal
 function openModal(modalId) {
   const modal = document.getElementById(modalId);
   modal.style.display = "block";
   document.body.style.overflow = "hidden"; // Disable scroll when modal is open
 }

 // Function to close a modal
 function closeModal(modalId) {
   const modal = document.getElementById(modalId);
   modal.style.display = "none";
   document.body.style.overflow = ""; // Re-enable scroll when modal is closed
 }
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
