

document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});

//---------------------------------- Table  Api -----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the user email from session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Define the API endpoints
        const getUserInfoUrl = `/api/admin/distributor/userInfo?email=${encodeURIComponent(userEmail)}`;

        // Fetch user info
        fetch(getUserInfoUrl)
            .then(response => response.json())
            .then(userData => {
            if (userData.phoneNumber) {
                // Fetch token count using the phone number
                const getTokenCountUrl = `/api/admin/token/count?identifier=${encodeURIComponent(userData.phoneNumber)}`;

                return fetch(getTokenCountUrl)
                    .then(response => response.json())
                    .then(tokenData => {
                    if (tokenData.tokenCount !== undefined) {
                        // Manually set the retailer ID and populate the table
                        const retailerTableBody = document.getElementById('retailerTableBody');
                        const retailerRow = `
                                    <tr>
                                        <td>1</td> <!-- Manually assigned ID -->
                                        <td>${userData.name || 'N/A'}</td>
                                        <td>${userData.email || 'N/A'}</td>
                                        <td>${userData.company || 'N/A'}</td>
                                        <td>${tokenData.tokenCount}</td>
                                        <td>${userData.phoneNumber || 'N/A'}</td>
                                    </tr>
                                `;
                        retailerTableBody.innerHTML = retailerRow;
                    } else {
                        console.error('Error fetching token count:', tokenData.error);
                    }
                });
            } else {
                console.error('Phone number not found in user data.');
            }
        })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('User email is not found in session storage.');
    }
});



//---------------------------------- toggleSidebar  method -----------------------------------
/**
* Template Name: NiceAdmin
* Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
* Updated: Apr 20 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

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


//----------------- (Token html Send Api )-------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sendTokenForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const recipientEmail = document.getElementById('inputEmail').value;
        const tokenAmount = document.getElementById('inputAmount').value;
        const sessionEmail = sessionStorage.getItem('userEmail'); // Replace with actual session retrieval method

        // Step 1: Fetch sender's phone number
        fetch(`/api/admin/token/getWalletAddress?email=${sessionEmail}`)
            .then(response => response.json())
            .then(senderData => {
            if (senderData && senderData.phoneNumber) {
                const senderPhoneNumber = senderData.phoneNumber;

                // Step 2: Fetch recipient information
                fetch(`/api/admin/distributor/userInfo?email=${recipientEmail}`)
                    .then(response => response.json())
                    .then(recipientData => {
                    if (recipientData && recipientData.email) {
                        const recipientPhoneNumber = recipientData.phoneNumber;

                        // Step 3: Fetch recipient's token amount
                        fetch(`/api/admin/token/count?identifier=${recipientPhoneNumber}`)
                            .then(response => response.json())
                            .then(tokenData => {
                            if (tokenData && tokenData.tokenCount !== undefined) {
                                // Step 4: Display recipient information and token amount
                                const retailerTableBody = document.getElementById('retailerTableBody');
                                retailerTableBody.innerHTML = ''; // Clear previous content

                                const row = document.createElement('tr');
                                row.innerHTML = `
                                                <td>${recipientData.id || 'N/A'}</td>
                                                <td>${recipientData.name || 'N/A'}</td>
                                                <td>${recipientData.email}</td>
                                                <td>${recipientData.company || 'N/A'}</td>
                                                <td>${tokenData.tokenCount}</td>
                                                <td>${recipientData.phoneNumber || 'N/A'}</td>
                                            `;
                                retailerTableBody.appendChild(row);

                                // Show the confirmation section
                                document.getElementById('confirmationSection').style.display = 'block';

                                // Step 5: Handle token sending on confirmation
                                document.getElementById('confirmSend').addEventListener('click', function() {
                                    fetch('/api/admin/token/send', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded'
                                        },
                                        body: new URLSearchParams({
                                            'senderIdentifier': senderPhoneNumber,
                                            'amount': tokenAmount,
                                            'recipient': recipientPhoneNumber
                                        })
                                    })
                                        .then(response => response.json())
                                        .then(sendResponse => {
                                        if (sendResponse.message) {
                                            alert(sendResponse.message);
                                            location.reload();
                                        } else {
                                            alert(sendResponse.error || 'Failed to send tokens');
                                        }
                                        // Reset form and hide confirmation section
                                        resetFormAndHideConfirmation();
                                    })
                                        .catch(error => {
                                        console.error('Error sending tokens:', error);
                                        alert('Failed to send tokens');
                                    });
                                });

                                // Handle cancellation
                                document.getElementById('cancelSend').addEventListener('click', function() {
                                    resetFormAndHideConfirmation();
                                });
                            } else {
                                alert('Failed to fetch recipient token amount');
                            }
                        })
                            .catch(error => {
                            console.error('Error fetching token amount:', error);
                            alert('Failed to fetch recipient token amount');
                        });
                    } else {
                        alert('Recipient not found');
                    }
                })
                    .catch(error => {
                    console.error('Error fetching recipient data:', error);
                    alert('Failed to fetch recipient data');
                });
            } else {
                alert('Sender phone number not found');
            }
        })
            .catch(error => {
            console.error('Error fetching sender data:', error);
            alert('Failed to fetch sender data');
        });
    });

    function resetFormAndHideConfirmation() {
        document.getElementById('sendTokenForm').reset();
        document.getElementById('confirmationSection').style.display = 'none';
    }
});
//---------------------------------- Activity  Api -----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail'); // Replace with code to get the user email from the session
    const walletAddressApiUrl = `/api/admin/token/getWalletAddress?email=${userEmail}`;
    const transactionsApiUrl = '/api/admin/token/distribution';

    let userWalletAddress = '';

    // Function to fetch user's wallet address
    function fetchUserWalletAddress() {
        return fetch(walletAddressApiUrl)
            .then(response => response.json()) // Read response as JSON
            .then(data => {
            console.log('Raw wallet address response:', data); // Debugging
            if (data.error) {
                throw new Error(data.error);
            }
            // Extract wallet address from the response object
            userWalletAddress = data.walletAddress;
            console.log('User wallet address:', userWalletAddress); // Debugging
        })
            .catch(error => console.error('Error fetching wallet address:', error));
    }

    // Function to fetch and display transactions
    function fetchAndDisplayTransactions() {
        fetch(transactionsApiUrl)
            .then(response => response.json())
            .then(data => {
            console.log('All transactions:', data); // Debugging
            const activityList = document.getElementById('activity-list');
            activityList.innerHTML = ''; // Clear existing content

            data.forEach(transaction => {
                // Show only transactions done by the user
                if (transaction.senderWalletAddress !== userWalletAddress) {
                    console.log('Skipping transaction:', transaction); // Debugging
                    return;
                }

                // Convert transaction date to a human-readable format
                const transactionDate = new Date(transaction.transactionDate);
                const timeAgo = formatTimeAgo(transactionDate);

                // Determine badge color based on recipient type
                let badgeColor;
                switch (transaction.recipientType) {
                    case 'distributor':
                        badgeColor = 'text-success';
                        break;
                    case 'PHONE':
                        badgeColor = 'text-danger';
                        break;
                    case 'admin':
                        badgeColor = 'text-primary';
                        break;
                    default:
                        badgeColor = 'text-muted';
                }

                // Create activity item
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item d-flex';

                const timeLabel = document.createElement('div');
                timeLabel.className = 'activite-label';
                timeLabel.textContent = timeAgo;

                const badge = document.createElement('i');
                badge.className = `bi bi-circle-fill activity-badge ${badgeColor} align-self-start`;

                const content = document.createElement('div');
                content.className = 'activity-content';
                content.innerHTML = `${transaction.description}`;

                activityItem.appendChild(timeLabel);
                activityItem.appendChild(badge);
                activityItem.appendChild(content);

                activityList.appendChild(activityItem);
            });
        })
            .catch(error => console.error('Error fetching transactions:', error));
    }

    // Helper function to format time ago
    function formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''}`;
        return 'Just now';
    }

    // Fetch user's wallet address and then fetch and display transactions
    fetchUserWalletAddress().then(fetchAndDisplayTransactions);
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

//----------------------------------Fetch count creators retailer  Api ----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const creatorEmail = sessionStorage.getItem('userEmail');

    // Fetch the list of retailers created by the distributor
    fetch(`/api/admin/retailer/list-by-creator?creatorEmail=${encodeURIComponent(creatorEmail)}`)
        .then(response => response.json())
        .then(data => {
        // Extract the retailers array from the response
        const retailers = data.retailers || [];

        // Calculate the number of retailers
        const retailerCount = retailers.length;

        // Update the sales card with the retailer count
        document.getElementById('retailerCount').textContent = retailerCount;
    })
        .catch(error => {
        console.error('Error fetching retailer count:', error);
        // Handle error case, possibly display 0
        document.getElementById('retailerCount').textContent = '0';
    });
});
//----------------------------------total Token  sales api  ----------------------------------
document.addEventListener("DOMContentLoaded", function() {
    // Assuming you have the userEmail stored in session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Step 1: Fetch user info
        fetch(`/api/admin/distributor/userInfo?email=${userEmail}`)
            .then(response => response.json())
            .then(userInfo => {
            const phoneNumber = userInfo.phoneNumber;

            if (phoneNumber) {
                // Step 2: Fetch total transferred tokens using the phone number
                fetch(`/api/admin/token/transferred/total?senderIdentifier=${phoneNumber}`)
                    .then(response => response.json())
                    .then(tokenInfo => {
                    const totalTransferredTokens = tokenInfo.totalTransferredTokens;

                    // Step 3: Update the frontend
                    document.getElementById("Tokensales").textContent = totalTransferredTokens;
                })
                    .catch(error => console.error('Error fetching token transfer data:', error));
            } else {
                console.error('Phone number not found in user info.');
            }
        })
            .catch(error => console.error('Error fetching user info:', error));
    } else {
        console.error('User email not found in session storage.');
    }
});

//----------------------------------total Token  Api ----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the user email from session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Define the API endpoint to get wallet address and phone number
        const getWalletAddressUrl = `/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

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
                    const getTokenCountUrl = `/api/admin/token/count?identifier=${encodeURIComponent(phoneNumber)}`;

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

//----------------------------------count token Api ----------------------------------
//----------------------------------Logout Api ----------------------------------

document.addEventListener("DOMContentLoaded", function() {
// Add event listener to the logout button
document.getElementById('logoutBtn').addEventListener('click', function(event) {
event.preventDefault(); // Prevent the default link behavior
sessionStorage.clear(); // Clear session storage
window.location.href = '/login.html'; // Redirect to login page or any other page
});
});
