document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});

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

//----------------------------------fetch UserName Api ----------------------------------

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

//---------------------------------------Delte Api-----------------------------------

//---------------------------------- Api ----------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Fetch the email from sessionStorage
    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) {
        alert('You are on a guest profile!');
        return;
    }

    // Fetch all distributors (including deactivated ones)
    fetch(`${API_URL}/api/admin/distributor/list`)
        .then(response => response.json())
        .then(distributors => {
            if (distributors && distributors.length > 0) {
                populateDistributorTable(distributors); // Populate the table with distributor data
            } else {
                alert('No distributors found.');
            }
        })
        .catch(error => console.error('Error fetching distributor data:', error));

    // Function to populate the table with distributor data
    function populateDistributorTable(distributors) {
        const tableBody = document.getElementById('deactivatedUsersTableBody');
        tableBody.innerHTML = ''; // Clear any existing rows

        distributors.forEach(distributor => {
            if (distributor.role === 'DISTRIBUTOR') {  // Only show distributors
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${distributor.name}</td>
                    <td>${distributor.email}</td>
                    <td>${distributor.company || '-'}</td>
                    <td>${distributor.phoneNumber}</td>
                    <td>${distributor.statePincode}</td>
                    <td>${distributor.status ? 'Active' : 'Inactive'}</td>  <!-- Show Status -->
                    <td>
                        <button class="btn btn-success" onclick="activateUser('${distributor.email}', '${distributor.creatorEmail}')">Activate</button>
                        <button class="btn btn-danger" onclick="deactivateUser('${distributor.email}', '${distributor.creatorEmail}')">Deactivate</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        });
    }

    // Function to handle activation of a distributor user
    window.activateUser = function (email, creatorEmail) {
        fetch(`${API_URL}/api/admin/distributor/activate-distributor?email=${encodeURIComponent(email)}&creatorEmail=${encodeURIComponent(creatorEmail)}`, {
            method: 'POST'
        })
        .then(response => {
            // Check if the response is JSON or plain text
            if (response.headers.get('content-type').includes('application/json')) {
                return response.json();  // Parse as JSON if content-type is JSON
            } else {
                return response.text();  // Otherwise, return as text
            }
        })
        .then(data => {
            // Handle plain text response (like "Distributor activated successfully." or other messages)
            if (typeof data === 'string') {
                if (data.includes("Distributor activated successfully.")) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Distributor activated successfully!',
                    }).then(() => {
                        // After showing the success alert, refresh the table to reflect the new status
                        fetch(`${API_URL}/api/admin/distributor/list`)
                            .then(response => response.json())
                            .then(distributors => populateDistributorTable(distributors)); // Update the table
                    });
                } else if (data.includes("Distributor is already activated.")) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Info!',
                        text: 'Distributor is already activated.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Unexpected error occurred.',
                    });
                }
            }
            // Handle JSON response (in case the response is in JSON format)
            else if (data.message === "Distributor activated successfully.") {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Distributor activated successfully!',
                }).then(() => {
                    // After showing the success alert, refresh the table to reflect the new status
                    fetch(`${API_URL}/api/admin/distributor/list`)
                        .then(response => response.json())
                        .then(distributors => populateDistributorTable(distributors)); // Update the table
                });
            }
        })
        .catch(error => {
            console.error('Error activating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Something went wrong.',
            });
        });
    };

    // Function to handle deactivation of a distributor user
  window.deactivateUser = function (email, creatorEmail) {
          fetch(`${API_URL}/api/admin/distributor/delete?email=${encodeURIComponent(email)}&creatorEmail=${encodeURIComponent(creatorEmail)}`, {
              method: 'POST'
          })
          .then(response => response.json())
          .then(data => {
              // Check if the response is an object with a message or error field
              if (data.message === "Distributor deactivated successfully") {
                  Swal.fire({
                      title: 'Success!',
                      text: 'Distributor deactivated successfully.',
                      icon: 'success',
                      confirmButtonText: 'OK'
                  }).then(() => {
                      fetch(`${API_URL}/api/admin/distributor/list`)  // Refresh the table after deactivation
                          .then(response => response.json())
                          .then(distributors => populateDistributorTable(distributors)); // Update the table
                  });
              } else if (data.error === "Distributor is already deactivated.") {
                  Swal.fire({
                      title: 'Info!',
                      text: 'Distributor is already deactivated.',
                      icon: 'info',
                      confirmButtonText: 'OK'
                  });
              } else {
                  // Handle unexpected error if any
                  Swal.fire({
                      title: 'Error!',
                      text: 'Unexpected error occurred.',
                      icon: 'error',
                      confirmButtonText: 'OK'
                  });
              }
          })
          .catch(error => {
              console.error('Error deactivating user:', error);
              Swal.fire({
                  title: 'Error!',
                  text: 'Error deactivating user.',
                  icon: 'error',
                  confirmButtonText: 'OK'
              });
          });
      };


    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function () {
        const searchQuery = this.value.toLowerCase();
        const rows = document.querySelectorAll('#deactivatedUsersTableBody tr');

        rows.forEach(row => {
            const cells = row.getElementsByTagName('td');
            const rowData = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');

            if (rowData.includes(searchQuery)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
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