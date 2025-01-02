document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});

//------------------------------------ Active page fucntion ---------------------------------------
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

//------------------------------------Create retailer api ---------------------------------------
//----------------------------------fetch UserName Api ----------------------------------

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
//----------------------------------Show Token retiler  Api ----------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const creatorEmail = sessionStorage.getItem('userEmail'); // Replace with actual user email or get from session
    const retailerTableBody = document.getElementById('retailerTableBody');
    const tokenTableBody = document.getElementById('tokenTableBody');

    // Fetch retailers data
    fetch(`/api/admin/retailer/list-by-creator?creatorEmail=${creatorEmail}`)
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
        if (data && Array.isArray(data.retailers)) {
            const retailers = data.retailers;

            // Populate retailer table
            retailers.forEach(retailer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                        <td>${retailer.id || 'null'}</td>
                        <td>${retailer.name || 'null'}</td>
                        <td>${retailer.designation || 'null'}</td>
                        <td>${retailer.email || 'null'}</td>
                        <td>${retailer.phoneNumber || 'null'}</td>
                        <td>${retailer.companyAddress || 'null'}</td>
                        <td>${retailer.password || 'null'}</td>
                    `;
                retailerTableBody.appendChild(row);
            });

            // Fetch tokens data
            fetch(`/api/admin/token/tokens?email=${creatorEmail}`)
                .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then(tokens => {
                // Create a map of tokens for quick lookup
                const tokenMap = new Map();
                tokens.forEach(token => {
                    tokenMap.set(token.userEmail, token.tokenAmount);
                });

                // Populate token table
                retailers.forEach(retailer => {
                    const tokenAmount = tokenMap.get(retailer.email) || 'null';
                    const tokenRow = document.createElement('tr');
                    tokenRow.innerHTML = `
                                <td>${retailer.name || 'null'}</td>
                                <td>${retailer.email || 'null'}</td>
                                <td>${retailer.phoneNumber || 'null'}</td>
                                <td>${tokenAmount}</td>
                            `;
                    tokenTableBody.appendChild(tokenRow);
                });
            })
                .catch(error => console.error('Error fetching token data:', error));
        } else {
            console.error('Expected an array of retailers but got:', data);
        }
    })
        .catch(error => console.error('Error fetching retailer data:', error));
});

//----------------------------------Show Table Api ----------------------------------

document.addEventListener('DOMContentLoaded', function() {
    const creatorEmail = sessionStorage.getItem('userEmail'); // Get the creatorEmail from session storage

    if (creatorEmail) {
        fetch(`/api/admin/retailer/list-by-creator?creatorEmail=${creatorEmail}`)
            .then(response => response.json())
            .then(data => {
            const retailerTableBody = document.getElementById('retailerTableBody');

            data.retailers.forEach(retailer => {
                // Handle null or empty fields
                const name = retailer.name || "null";
                const designation = retailer.designation || "null";
                const email = retailer.email || "null";
                const phoneNumber = retailer.phoneNumber || "null";
                const companyAddress = retailer.companyAddress || "null";
                const password = retailer.password || "null";

                // Create a new table row
                const row = document.createElement('tr');

                // Insert cells into the row
                row.innerHTML = `
                        <td>${retailer.id}</td>
                        <td>${name}</td>
                        <td>${designation}</td>
                        <td>${email}</td>
                        <td>${phoneNumber}</td>
                        <td>${companyAddress}</td>
                        <td>${password}</td>
                    `;

                // Append the row to the table body
                retailerTableBody.appendChild(row);
            });
        })
            .catch(error => {
            console.error('Error fetching retailers:', error);
        });
    } else {
        console.error('Creator email not found in session storage.');
    }
});
//---------------------------------------Delte Api-----------------------------------
document.getElementById('deleteRetailerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('inputEmail').value;
    const sessionEmail = sessionStorage.getItem('userEmail'); // Replace with the actual session email

    // Fetch the user details
    fetch(`/api/admin/distributor/userInfo?email=${email}`)
        .then(response => response.json())
        .then(userData => {
            if (userData && userData.email) {
                // Fetch the token amount for the user
                fetch(`/api/admin/token/tokens?email=${sessionEmail}`)
                    .then(response => response.json())
                    .then(tokenData => {
                        let tokenAmount = 0;
                        // Find the tokenAmount corresponding to the entered email
                        const tokenInfo = tokenData.find(token => token.userEmail === email);
                        if (tokenInfo) {
                            tokenAmount = tokenInfo.tokenAmount;
                        }

                        // Display user data in the table
                    const retailerTableBody = document.getElementById('retailerTableBody');
                    if (retailerTableBody) {
                        retailerTableBody.innerHTML = ''; // Clear any previous content

                        // Proceed with appending new rows
                        const tokenInfo = tokenData.find(token => token.userEmail === email);
                        let tokenAmount = tokenInfo ? tokenInfo.tokenAmount : 0;

                        const row = document.createElement('tr');
                        row.innerHTML = `
                                <td>${userData.id}</td>
                                <td>${userData.name || 'N/A'}</td>
                                <td>${userData.email}</td>
                                <td>${userData.company || 'N/A'}</td>
                                 <td>${tokenAmount}</td>
                                <td>${userData.phoneNumber || 'N/A'}</td>
                                    `;
                        retailerTableBody.appendChild(row);
                    } else {
                        console.error('retailerTableBody element not found');
                    }
                        // Show the confirmation section
                        document.getElementById('confirmationSection').style.display = 'block';
                    });
            } else {
                alert('User not found');
            }
        });
});
document.getElementById('confirmDelete').addEventListener('click', function () {
    const email = document.getElementById('inputEmail').value;
    const sessionEmail = sessionStorage.getItem('userEmail');

    fetch(`/api/admin/retailer/user-role?email=${sessionEmail}`)
        .then(response => response.json())
        .then(roleData => {
            if (roleData && roleData.role) {
                const role = roleData.role;

                fetch(`/api/admin/retailer/delete?email=${email}&creatorEmail=${sessionEmail}&requestingUserRole=${role}`, {
                    method: 'POST',
                })
                    .then(response => response.json())
                    .then(data => {
                        const modalMessage = document.getElementById('modalMessage');
                        const successModal = new bootstrap.Modal(document.getElementById('successModal'));

                        if (data.error) {
                            modalMessage.textContent = data.error || "An error occurred.";
                            successModal.show();
                        } else if (data.message) {
                            modalMessage.textContent = data.message || 'Retailer deactivated successfully!';
                            successModal.show();
                            document.getElementById('deleteRetailerForm').reset();
                            document.getElementById('confirmationSection').style.display = 'none';
                        } else {
                            modalMessage.textContent = "Unexpected response from the server.";
                            successModal.show();
                        }
                    })
                    .catch(error => {
                        document.getElementById('modalMessage').textContent = "An error occurred while processing the request.";
                        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                        successModal.show();
                    });
            } else {
                document.getElementById('modalMessage').textContent = "Failed to fetch user role.";
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            }
        })
        .catch(error => {
            document.getElementById('modalMessage').textContent = "An error occurred while fetching user role.";
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        });
});

document.getElementById('cancelDelete').addEventListener('click', function() {
    // Reset the form and hide the confirmation section
    document.getElementById('deleteRetailerForm').reset();
    document.getElementById('confirmationSection').style.display = 'none';
});


//----------------------activate reatiler form -------------------
// Activate Retailer Form Submission
document.getElementById('deleteDistributorForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const retailerEmail = document.getElementById('inputEmail1').value; // Get retailer email from the form
    const sessionEmail = sessionStorage.getItem('userEmail'); // Get the current user's email from session storage

    if (!retailerEmail) {
        alert("Please enter a retailer email.");
        return;
    }

    // Step 1: Fetch retailer details and token amount
    fetch(`/api/admin/distributor/userInfo?email=${retailerEmail}`)
        .then(response => response.json())
        .then(userData => {
            if (userData && userData.email) {
                // Fetch token amount for the retailer
                fetch(`/api/admin/token/tokens?email=${sessionEmail}`)
                    .then(response => response.json())
                    .then(tokenData => {
                        let tokenAmount = 0;
                        const tokenInfo = tokenData.find(token => token.userEmail === retailerEmail);
                        if (tokenInfo) {
                            tokenAmount = tokenInfo.tokenAmount;
                        }

                        // Display retailer details and token amount in the confirmation section
                        const retailerTableBody = document.getElementById('retailerTableBody1');
                        retailerTableBody.innerHTML = ''; // Clear any previous content
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${userData.id}</td>
                            <td>${userData.name || 'N/A'}</td>
                            <td>${userData.email}</td>
                            <td>${userData.company || 'N/A'}</td>
                            <td>${tokenAmount}</td>
                            <td>${userData.phoneNumber || 'N/A'}</td>
                        `;
                        retailerTableBody.appendChild(row);

                        // Show the confirmation section
                        document.getElementById('confirmationSection1').style.display = 'block';
                    })
                    .catch(error => {
                        alert("An error occurred while fetching token data.");
                    });
            } else {
                alert("Retailer not found.");
            }
        })
        .catch(error => {
            alert("An error occurred while fetching retailer details.");
        });
});

// Handle confirmation of activation
document.getElementById('confirmDelete1').addEventListener('click', function() {
    const retailerEmail = document.getElementById('inputEmail1').value; // Get retailer email from the form
    const sessionEmail = sessionStorage.getItem('userEmail'); // Get the current user's email from session storage

    // Step 2: Fetch creator email using the current user's email
    fetch(`/api/admin/distributor/get-creator-email?email=${sessionEmail}`)
        .then(response => response.text()) // Since it's plain text (email), we use .text() here
        .then(creatorEmail => {
            if (creatorEmail) {
                // Step 3: Activate the retailer using the retailer email and creator email
                fetch(`/api/admin/retailer/activate-retailer?email=${retailerEmail}&creatorEmail=${creatorEmail}`, {
                    method: 'POST',
                })
                    .then(response => response.text()) // Handle plain text response from the server
                    .then(apiResponse => {
                        const modalMessage = document.getElementById('modalMessage');
                        const successModal = new bootstrap.Modal(document.getElementById('successModal'));

                        // Display the API response in the modal
                        modalMessage.textContent = apiResponse || "Retailer activated successfully!"; // If API response is empty, show default message

                        // Show the modal
                        successModal.show();

                        // Reset the form and hide the confirmation section
                        document.getElementById('deleteDistributorForm').reset();
                        document.getElementById('confirmationSection1').style.display = 'none';
                    })
                    .catch(error => {
                        // Handle network or server error
                        const modalMessage = document.getElementById('modalMessage');
                        modalMessage.textContent = "An error occurred while processing the request.";
                        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                        successModal.show();
                    });
            } else {
                // Handle missing creator email
                const modalMessage = document.getElementById('modalMessage');
                modalMessage.textContent = "Failed to fetch creator email.";
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
            }
        })
        .catch(error => {
            // Handle network or server error for fetching creator email
            const modalMessage = document.getElementById('modalMessage');
            modalMessage.textContent = "An error occurred while fetching creator email.";
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        });
});

// Handle cancellation of activation
document.getElementById('cancelDelete1').addEventListener('click', function() {
    // Hide the confirmation section and reset the form
    document.getElementById('confirmationSection1').style.display = 'none';
});
//----------------------------------Logout Api ----------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = './login.html'; // Redirect to login page or any other page
    });
});