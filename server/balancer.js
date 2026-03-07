import http from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({});

// Master list of available upstream nodes
const ALL_SERVERS = [
  'http://localhost:4001',
  'http://localhost:4002'
];

// Active rotation pool
let activeServers = [...ALL_SERVERS]; 
let currentIndex = 0;

// Proactive health monitoring loop
const checkServers = () => {
  ALL_SERVERS.forEach((serverUrl) => {
    http.get(serverUrl, (res) => {
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

setInterval(checkServers, 2000);

const server = http.createServer((req, res) => {
  // Prevent unhandled errors when the pool is completely exhausted
  if (activeServers.length === 0) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: "CRITICAL: All backend servers are down!" }));
  }

  const target = activeServers[currentIndex % activeServers.length];
  currentIndex++;

  console.log(`[Load Balancer] Routing request to: ${target}`);

  proxy.web(req, res, { target: target });
});

// Failsafe for mid-flight drops during routing
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy Error] Connection failed:`, err.message);
  if (!res.headersSent) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Bad Gateway" }));
  }
});

server.listen(4000, () => {
  console.log('🚀 Smart Node.js Load Balancer is running on port 4000!');
  checkServers(); // Initialize states immediately
});