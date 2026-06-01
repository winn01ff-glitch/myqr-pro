const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const DIR  = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let decodedUrl = decodeURIComponent(req.url);
  let file = decodedUrl === '/' ? '/index.html' : decodedUrl;
  const abs = path.join(DIR, file);

  fs.readFile(abs, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(abs);
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n✅ Server đang chạy tại: http://localhost:${PORT}`);
  console.log('   Mở link trên trình duyệt để dùng QR Generator');
  console.log('   Nhấn Ctrl+C để tắt server\n');
});
