// This file will be placed in the root of your deployed application
// It sets the API URL configuration before the app loads
window.env = window.env || {};
window.env.apiUrl = window.env.apiUrl || 'https://bookstore-backend-production.up.railway.app/api';
console.log('API URL set to:', window.env.apiUrl);
