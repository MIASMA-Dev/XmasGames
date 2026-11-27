const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function handleRequest(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(DIST_DIR, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // Serve index.html for SPA routing
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data2);
      });
      return;
    }
    
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = createServer(handleRequest);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});