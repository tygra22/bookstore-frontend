// Include this in index.html to test API connectivity
// This bypasses Angular and directly tests the backend connectivity

function testApi() {
  // Test endpoints
  const endpoints = [
    'https://bookstore-backend-public.up.railway.app/',
    'https://bookstore-backend-public.up.railway.app/api/books',
    'https://bookstore-backend-public.up.railway.app/api/health'
  ];
  
  console.log('TESTING API CONNECTIVITY DIRECTLY:');
  
  endpoints.forEach(url => {
    console.log(`Testing: ${url}`);
    fetch(url)
      .then(response => {
        console.log(`✅ ${url} - Status: ${response.status}`);
        return response.text();
      })
      .then(data => {
        console.log(`Response from ${url}:`, data.substring(0, 100) + (data.length > 100 ? '...' : ''));
      })
      .catch(error => {
        console.error(`❌ Error with ${url}:`, error);
      });
  });
}

// Run tests
testApi();
