const isLocal = false; // Set to true to use local, false to use the server API
 const API_BASE_URL = 'https://selfidcard.in:8443';
 const API_LOCAL_URL = 'http://localhost:8443';
 const API_URL = isLocal ? API_LOCAL_URL : API_BASE_URL;