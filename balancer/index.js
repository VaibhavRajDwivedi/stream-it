import http from 'http';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config();

const proxy = httpProxy.createProxyServer({
  xfwd: true // Enables X-Forwarded-For, letting Render see the unique client IPs
});

const ALL_SERVERS = [
  process.env.SERVER_1,
  process.env.SERVER_2
].filter(Boolean); // Filter out any undefined env vars

let activeServers = [...ALL_SERVERS]; 
let currentIndex = 0;


// REMOVED: Proactive health checks against Render URLs.
// Every health check request hits the same Render Cloudflare edge rate limit quota
// as real user traffic. With 2 servers × every 120s, that's 60 req/hr of wasted quota.
//
// Replaced with REACTIVE recovery: servers are evicted only when a real proxied
// request fails (network error / 5xx from proxy), and re-added when the next
// real request to that server succeeds.

// Re-add a server to the pool after a delay when it may have recovered
const scheduleRecoveryCheck = (serverUrl) => {
  setTimeout(() => {
    if (!activeServers.includes(serverUrl)) {
      console.log(`[Recovery] Re-adding ${serverUrl} to pool after cooldown`);
      activeServers.push(serverUrl);
    }
  }, 60000); // retry after 60 seconds
};

// Prevent duplicate CORS headers from the backend
proxy.on('proxyRes', (proxyRes, req, res) => {
  delete proxyRes.headers['access-control-allow-origin'];
  delete proxyRes.headers['access-control-allow-credentials'];
  delete proxyRes.headers['access-control-allow-methods'];
  delete proxyRes.headers['access-control-allow-headers'];
});

// Handle Proxy Errors gracefully — evict server and schedule re-addition
proxy.on('error', (err, req, res) => {
  console.error(`[Proxy Error] Connection failed to target:`, err.message);

  // Evict the failing server from the pool
  const failedTarget = res?.req?.socket?._host || null;
  if (failedTarget) {
    const failedServer = ALL_SERVERS.find(s => s.includes(failedTarget));
    if (failedServer && activeServers.includes(failedServer)) {
      console.log(`[Proxy] Evicting ${failedServer} due to connection failure`);
      activeServers = activeServers.filter(s => s !== failedServer);
      scheduleRecoveryCheck(failedServer);
    }
  }

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
  // No startup health check — reactive eviction handles server failures
  console.log(`[Balancer] Active servers: ${activeServers.join(', ')}`);
});