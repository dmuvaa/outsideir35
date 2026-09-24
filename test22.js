const http = require('http');

http.get('http://localhost:3000/login', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // find the dashboard layout div
    console.log("Status:", res.statusCode);
  });
});
