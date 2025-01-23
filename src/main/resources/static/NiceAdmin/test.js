
 //----------------------------------Submit button API -----------------------------------
document.getElementById('idCardForm').addEventListener('submit', generateIdCard);

async function generateIdCard(event) {

    event.preventDefault(); // Prevent the default form submission
 const selectedType = document.querySelector('input[name="employmentType"]:checked');

    if (!selectedType) {
        alert("Please select Employment Type before proceeding.");
        return;
    }
    // Collect form data
    const form = document.getElementById('idCardForm');
    const formData = new FormData(form);

    // Fetch retailerEmail from session storage
    const retailerEmail = sessionStorage.getItem('userEmail'); // Assuming 'userEmail' is stored in session storage

    if (!retailerEmail) {
        console.error("retailerEmail is not available in session storage.");
        return; // Stop the process if retailerEmail is not found
    }
    formData.append('employeeType', selectedType.value === 'selfEmployed' ? 'SelfEmployed' : 'Employee');
    // Add retailerEmail to form data
    formData.append('retailerEmail', retailerEmail);

    // Check if 'email' field exists and update it as 'emailAddress'
    const email = formData.get('email');
    if (email) {
        formData.delete('email'); // Remove the old 'email' field
        formData.append('emailAddress', email); // Add it with the correct name
    } else {
        console.error("'email' field is not found in formData.");
        return; // Stop the process if 'email' is not found
    }

    try {
        // Send a POST request to the createIdCard API to generate the HTML content
        const response = await fetch('/api/admin/retailer/createIdCard', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
        await saveUserIdCard(formData);
            const htmlContent = await response.text();
            const iframe = document.getElementById('previewIframe');

            // Set the HTML content inside the iframe
            iframe.srcdoc = htmlContent;

            // Wait for the iframe to load and inject the custom styles
            iframe.onload = function () {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                // Inject the custom styles into the iframe's head
                const style = document.createElement('style');
                style.innerHTML = `
                    /* Your custom styles here */
                     .main {
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                            grid-template-columns: 2.3fr 0.7fr;
                                            width: 100%;
                                            padding: 10px;
                                        }
                                        .form {
                                        margin:0;
                                        }
                                        .form:nth-child(1){
                                            width:80%;
                                        }
                                        .form:nth-child(2){
                                            width:100%;
                                        }
                                       .card {
                                           width: 100%;
                                           height: auto;
                                           border-radius: 20px;
                                           background-color: #ffffff;
                                           border-top: 20px solid #17146e;
                                           margin-top: 20px;
                                       }
                                       .footer {
                                           position: relative;
                                           bottom: 0;
                                           background-color: #2c2c64;
                                           width: 100%;
                                           font-family: Inter;
                                           font-size: 10px;
                                           font-weight: 500;
                                           text-align: center;
                                           color: #ffffff;
                                           border-radius: 0 0 20px 20px;
                                           display: flex;
                                           align-items: center;
                                           justify-content: center;
                                           padding: 8px;
                                           height: 60px;
                                       }
                                        .header {
                                            border-bottom: 5px solid #25257d;
                                            text-align: center;
                                            color: #17146e;
                                            font-family: Inter;
                                            font-size: 24px;
                                            font-weight: 500;
                                            line-height: 26px;
                                        }

                                        table {
                                            border-collapse: collapse;
                                            width: 100%;
                                        }
                                      table tr td {
                                          font-family: Inter;
                                          font-size: 15px;
                                          font-weight: 550;
                                          line-height: 33.89px;
                                          color: #17146e;
                                          padding: 0px 0 0px;
                                      }
                                        input {
                                            font-family: Inter;
                                            font-size: 18px;
                                            font-weight: 400;
                                            line-height: 33.89px;
                                            text-align: left;
                                            color: #383747;
                                            outline: none;
                                            border: 0px;
                                            background-color: #ffffff;
                                            padding-left: 5px;
                                        }
                                       table tr td textarea {
                                           font-family: Inter;
                                           font-size: 15px;
                                           font-weight: 400;
                                           line-height: 33.89px;
                                           text-align: left;
                                           color: #383747;
                                           outline: none;
                                           border: 0px;
                                           background-color: #ffffff;
                                            width: 100%;
                                           padding-left: 5px;
                                           resize: none;
                                           overflow-wrap: break-word;
                                           word-wrap: break-word;
                                       }
                                        table tr td input {
                                            font-family: Inter;
                                            font-size: 18px;
                                            font-weight: 400;
                                            line-height: 33.89px;
                                            text-align: left;
                                            color: #383747;
                                            outline: none;
                                            border: 0px;
                                            background-color: #ffffff;
                                            padding-left: 5px;
                                        }
                                       img {
                                           max-width: 80px;
                                           height: auto;
                                           margin: 0;
                                       }
                `;
                iframeDoc.head.appendChild(style);
            };

            // After receiving 200 OK, process form data for localStorage
            const formDataObject = {};
            for (const [key, value] of formData.entries()) {
                formDataObject[key] = value;
            }

            // Handle the image conversion to Base64
            const fileInput = form.querySelector('input[type="file"]');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = function (event) {
                    // Convert image to Base64 and add to the formDataObject
                    formDataObject.photo = event.target.result;

                    // Store the data in localStorage
                    localStorage.setItem('form-data', JSON.stringify(formDataObject));
                    console.log("Form data saved to localStorage:", formDataObject);
                      document.getElementById('printButton').style.display = 'inline-block';
                };

                reader.onerror = function (error) {
                    console.error("Error converting image to Base64:", error);
                };

                reader.readAsDataURL(file);
            } else {
                // If no file is uploaded, directly save the data
                localStorage.setItem('form-data', JSON.stringify(formDataObject));
                console.log("Form data saved to localStorage (without image):", formDataObject);
            }
        } else {
            console.error("Failed to generate ID card:", response.statusText);
        }
    } catch (error) {
        console.error("Error generating ID card:", error);
    }
}


async function saveUserIdCard(formData) {
    try {
        const response = await fetch('/api/user-id-card/save', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            console.log("ID card details saved successfully:", result);
        } else {
            console.error("Failed to save ID card details:", response.statusText);
        }
    } catch (error) {
        console.error("Error saving ID card details:", error);
    }
}
//---------------------------------Print API Button -----------------------------
// Print the ID card when the Print button is clicked
document.getElementById('printButton').addEventListener('click', async function () {
    try {
        // Step 1: Fetch retailerEmail from sessionStorage
        const retailerEmail = sessionStorage.getItem('userEmail');
        const response = await fetch(`/api/user-id-card/${retailerEmail}`, {
            method: 'GET',
        });
        const data = await response.json();

        // Step 2: Prepare the FormData
        const formData = new FormData();

        // Append the values from the response to the formData
        formData.append('retailerEmail', data.retailerEmail);
        formData.append('name', data.name);
        formData.append('businessName', data.businessName);
        formData.append('businessAddress', data.businessAddress);
        formData.append('currentAddress', data.currentAddress);
        formData.append('permanentAddress', data.permanentAddress);
        formData.append('phoneNumber', data.phoneNumber);
        formData.append('emailAddress', data.emailAddress);
        formData.append('employeeType' , data.employeeType)

        // If you have a photo URL and need to upload the image, you can append it like this
        // Assuming the photo URL is a file path or Blob (if the file is already available)
        const photoFile = data.photoUrl;  // Assuming this is a file path or Blob
        formData.append('photo', photoFile);

        // Step 3: Send the FormData to the second API
        const createIdCardResponse = await fetch('/api/admin/retailer/createIdCardFinal', {
            method: 'POST',
            body: formData,  // Send the form data
        });

        // Step 4: Call the second API to generate the ID card


        if (!createIdCardResponse.ok) {
            console.error('Failed to create ID card:', createIdCardResponse.statusText);
            return;
        }

        // Step 5: Render the returned HTML in an iframe and trigger print
        const htmlContent = await createIdCardResponse.text();
        const iframe = document.getElementById('previewIframe1');
        iframe.srcdoc = htmlContent;

        iframe.onload = function () {
            iframe.contentWindow.print(); // Trigger print
        };

    } catch (error) {
        console.error('An error occurred:', error);
    }
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
    //--------------------------------Toggle side abr anv  ----------------------

(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el) => {
        return document.querySelector(el.trim());
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener) => {
        const element = select(el);
        if (element) {
            element.addEventListener(type, listener);
        }
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function() {
            select('body').classList.toggle('toggle-sidebar');
        });
    }
})();
//---------------------------Prevent Screen shot ----------------------------
// Black overlay function
function hideContentTemporarily() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "black";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, 1000); // Hide overlay after 1 second
}

// Detect PrintScreen (Windows)
document.addEventListener("keyup", function (e) {
    if (e.key === "PrintScreen") {
        alert("Screenshots are disabled on this page.");
        hideContentTemporarily();
    }
});

// Use mouse and keyboard events as a fallback to obscure content
document.addEventListener("keydown", function (e) {
    if (e.metaKey && e.shiftKey) {
        hideContentTemporarily();
        alert("Content obscured for security.");
    }
});
window.addEventListener('blur', function () {
    document.body.style.filter = "blur(10px)";
    setTimeout(() => {
        document.body.style.filter = "none";
    }, 1000);
});