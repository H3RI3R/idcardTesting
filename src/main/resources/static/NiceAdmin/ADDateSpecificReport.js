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

//------------------------Token report Activity api --------------------------
document.addEventListener("DOMContentLoaded", function() {
    const userEmail = sessionStorage.getItem("userEmail"); // Assuming the email is stored in sessionStorage
    const activityList = document.getElementById("activity-list");
    const filterButton = document.getElementById("filter-button");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // Function to fetch activities with date range filter
    function fetchActivities(startDate = '', endDate = '') {
        let url = `${API_URL}/api/admin/distributor/AdminActivity?adminEmail=${userEmail}`;
        if (startDate && endDate) {
            url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Clear any existing activities
                activityList.innerHTML = "";

                // Filter activities based on date range
                const filteredActivities = data.filter(activity => {
                    const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];  // Extract the date part only
                    const start = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
                    const end = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

                    return (
                        (!start || activityDate >= start) &&  // Check if activity date is after or equal to start date
                        (!end || activityDate <= end)        // Check if activity date is before or equal to end date
                    );
                });

                // Check if there are filtered activities
                if (filteredActivities.length > 0) {
                    filteredActivities.forEach(activity => {
                        // Determine the appropriate icon based on the activity type
                        let iconSrc = "assets/img/DefaultIcon.png"; // Default icon

                        switch (activity.type) {
                            case "TOKEN_SENT":
                                iconSrc = "assets/img/SendToken.png";
                                break;
                            case "TOKEN_RECEIPT":
                                iconSrc = "assets/img/RecievedToken.png";
                                break;
                            case "TOKEN_CREATION":
                            case "DISTRIBUTOR_CREATION":
                            case "RETAILER_CREATION":
                                iconSrc = "assets/img/CreateRetailer.png";
                                break;
                            case "DISTRIBUTOR_DELETION":
                            case "RETAILER_DELETION":
                                iconSrc = "assets/img/Deleter.png";
                                break;
                            default:
                                iconSrc = "assets/img/DefaultIcon.png"; // Fallback icon
                        }

                        // Create a new div element for each activity
                        const activityItem = document.createElement("div");
                        activityItem.className = "activity-item d-flex align-items-center";

                        // Set the inner HTML of the activity item
                        activityItem.innerHTML = `
                            <div class="activity-icon">
                                <img src="${iconSrc}" alt="${activity.type} icon" style="width: 24px; height: 24px; margin-right: 10px;">
                            </div>
                            <div class="activity-details">
                                <div class="activity-type">${activity.type}</div>
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-timestamp">${new Date(activity.timestamp).toLocaleString()}</div>
                            </div>
                        `;

                        // Append the activity item to the activity list
                        activityList.appendChild(activityItem);
                    });
                } else {
                    // No filtered activities found
                    activityList.innerHTML = "<p>No activities found for the selected date range.</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching activities:", error);
                activityList.innerHTML = "<p>Failed to load activities.</p>";
            });
    }

    // Fetch activities on page load
    fetchActivities();

    // Add event listener to filter button
    filterButton.addEventListener("click", function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        fetchActivities(startDate, endDate);
    });
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