(function(window) {
  window.env = window.env || {};
  window.env.apiUrl = 'https://bookstore-backend-production.up.railway.app/api';
  console.log('API URL loaded from env.js:', window.env.apiUrl);
})(this);
