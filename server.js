const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;
const root = process.cwd();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(root, urlPath);
  if (urlPath === '/' || !path.extname(urlPath)) {
    // default to index.html
    filePath = path.join(root, 'index.html');
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      fs.readFile(path.join(root, '404.html'), (err404, data) => {
        res.writeHead(404, { 'Content-Type': err404 ? 'text/plain' : 'text/html; charset=utf-8' });
        res.end(err404 ? 'Not Found' : data);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});