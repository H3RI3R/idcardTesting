//-------------------------------Create Tokens---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('CreateTokenForm');
    const messageDiv = document.getElementById('tokenCreationMessage');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Retrieve values
        const amount = document.getElementById('inputAmount').value;
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            messageDiv.textContent = 'Error: User email is not set in session storage.';
            return;
        }

        // Fetch the wallet address
        const walletAddressUrl = `${API_URL}/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

        fetch(walletAddressUrl)
            .then(response => response.json())
            .then(data => {
            const walletAddress = data.walletAddress;

            // Prepare data for token creation API
            const apiUrl = `${API_URL}/api/admin/token/create`;
            const params = new URLSearchParams();
            params.append('walletAddress', walletAddress);
            params.append('email', userEmail);
            params.append('amount', amount);

            // Send a POST request to create tokens
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
                messageDiv.textContent = `Error: ${data.error}`;
            } else {
                messageDiv.textContent = data.message;
            }
        })
            .catch(error => {
            console.error('Error:', error);
            messageDiv.textContent = 'An error occurred while creating tokens.';
        });
    });
});