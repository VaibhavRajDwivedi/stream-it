import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config();

const proxy = httpProxy.createProxyServer({});

const ALL_SERVERS = [
  process.env.SERVER_1,
  process.env.SERVER_2
];

let activeServers = [...ALL_SERVERS]; 
let currentIndex = 0;

const checkServers = () => {
  ALL_SERVERS.forEach((serverUrl) => {
    if (!serverUrl) return; 

    const req = https.get(serverUrl, (res) => {
      // If Render returns a 5xx error, the server is down or sleeping
      if (res.statusCode >= 500) {
        if (activeServers.includes(serverUrl)) {
          console.log(`[Health Check] Server returning ${res.statusCode}: ${serverUrl}. Removing!`);
          activeServers = activeServers.filter(s => s !== serverUrl);
        }
      } else {
        // Any 2xx, 3xx, or 4xx means the Express app is successfully running
        if (!activeServers.includes(serverUrl)) {
          console.log(`[Health Check] Server recovered: ${serverUrl}`);
          activeServers.push(serverUrl);
        }
      }
    });

    // Catches network failures and our manual timeout destruction below
    req.on('error', (err) => {
      if (activeServers.includes(serverUrl)) {
        console.log(`[Health Check] Server dead or sleeping: ${serverUrl}. Removing!`);
        activeServers = activeServers.filter(s => s !== serverUrl);
      }
    });

    // CRITICAL: If a Render server is sleeping, it hangs. 
    // We give it 4 seconds to respond. If it doesn't, we consider it dead.
    req.setTimeout(4000, () => {
      req.destroy(); 
    });
  });
};

// Run the health check every 10 seconds
setInterval(checkServers, 10000);

// Prevent duplicate CORS headers from the backend
proxy.on('proxyRes', (proxyRes, req, res) => {
  delete proxyRes.headers['access-control-allow-origin'];
  delete proxyRes.headers['access-control-allow-credentials'];
  delete proxyRes.headers['access-control-allow-methods'];
  delete proxyRes.headers['access-control-allow-headers'];
});

// Handle Proxy Errors gracefully
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy Error] Connection failed:`, err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Bad Gateway" }));
  }
});

const server = http.createServer((req, res) => {
  // 1. Force CORS directly on the Load Balancer for every request
  const origin = 'https://stream-it-indol.vercel.app';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 2. Intercept Preflight OPTIONS request and approve it instantly
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (activeServers.length === 0) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: "CRITICAL: All backend servers are down!" }));
  }

  const target = activeServers[currentIndex % activeServers.length];
  currentIndex++;

  console.log(`[Load Balancer] Routing ${req.method} request to: ${target}`);

  proxy.web(req, res, { target: target, changeOrigin: true });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Smart Load Balancer running on port ${PORT}`);
  checkServers(); 
});