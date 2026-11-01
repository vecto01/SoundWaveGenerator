const http = require('http');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const PORT = 3000;
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading page');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});