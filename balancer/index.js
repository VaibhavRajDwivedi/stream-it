import http from 'http';
import https from 'https'; // Required for pinging Render's secure URLs
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config();

const proxy = httpProxy.createProxyServer({});

// Master list of your upstream Render nodes
const ALL_SERVERS = [
  process.env.SERVER_1,
  process.env.SERVER_2
];

// Active rotation pool
let activeServers = [...ALL_SERVERS]; 
let currentIndex = 0;

// Proactive health monitoring loop
const checkServers = () => {
  ALL_SERVERS.forEach((serverUrl) => {
    // We use https.get here because the target URLs are secure
    https.get(serverUrl, (res) => {
      // Reintegrate recovered nodes
      if (!activeServers.includes(serverUrl)) {
        console.log(`[Health Check] Server recovered: ${serverUrl}`);
        activeServers.push(serverUrl);
      }
    }).on('error', (err) => {
      // Evict dead nodes to prevent routing errors
      if (activeServers.includes(serverUrl)) {
        console.log(`[Health Check] Server died: ${serverUrl}. Removing from rotation!`);
        activeServers = activeServers.filter(s => s !== serverUrl);
      }
    });
  });
};

// Check every 10 seconds (I increased this from 2s so Render doesn't flag you for a DDoS attack!)
setInterval(checkServers, 10000);

const server = http.createServer((req, res) => {
  // Prevent unhandled errors when the pool is completely exhausted
  if (activeServers.length === 0) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: "CRITICAL: All backend servers are down!" }));
  }

  const target = activeServers[currentIndex % activeServers.length];
  currentIndex++;

  console.log(`[Load Balancer] Routing request to: ${target}`);

  // changeOrigin: true is REQUIRED so Render knows which web service to route to internally
  proxy.web(req, res, { target: target, changeOrigin: true });
});

// Failsafe for mid-flight drops during routing
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy Error] Connection failed:`, err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Bad Gateway" }));
  }
});

// Render assigns a dynamic port, default to 4000 locally
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Smart Node.js Load Balancer is running on port ${PORT}!`);
  checkServers(); // Initialize states immediately
});