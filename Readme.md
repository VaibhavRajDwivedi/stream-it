# StreamIt 🎬

> A full-stack, high-performance video streaming platform built with a decoupled architecture — featuring a Next.js client, Node.js/Express backend, PostgreSQL database, and a custom-built Layer 7 load balancer.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, Tailwind CSS, Axios |
| **Backend** | Node.js, Express, Prisma ORM |
| **Database** | PostgreSQL via Supabase (with pgvector) |
| **Auth** | JSON Web Tokens (JWT), HTTP-only Cookies |
| **Infra** | Vercel (client), Render (server + balancer), Custom Node.js Load Balancer |

---

## 📁 Project Structure

```
streamit/
├── client/        # Next.js frontend application
├── server/        # Express.js API, Prisma schema
└── balancer/      # Custom Node.js Layer 7 Load Balancer
```

---

## ✨ Feature Overview

### 🔐 Authentication & Security
- **JWT-Based Authentication** — Stateless user sessions using JSON Web Tokens
- **Secure Cookie Storage** — Tokens stored in HTTP-only, `Secure`, `SameSite=none` cookies to prevent XSS and enable cross-domain auth
- **User Registration & Login** — Dedicated auth flows with UI feedback
- **Session Management** — Logout functionality and protected route middleware
- **CORS** — Handled directly at the Load Balancer edge to securely intercept and approve preflight requests from the Vercel frontend

### 🎥 Core Video Functionality
- **Dynamic Video Feed** — "Recommended for You" homepage with a responsive video grid
- **Content Metadata Display** — Thumbnails, titles, creator usernames, and creator avatars
- **Video Upload Pipeline** — "Create" workflow for uploading content to cloud storage
- **Video Player / Streaming** — Delivery and playback of video files to the client

### 👍 User Interaction & Engagement
- **Like / Unlike System** — Thumbs-up interaction on any video
- **Liked Videos Dashboard** — Dedicated page aggregating all videos a user has liked
- **Watch History Tracking** — Database-level logging and retrieval of a user's recently viewed videos

### 🔍 Search & Discovery
- **Global Search Bar** — Persistent top-nav search input for querying the database
- **Vector Search Integration** — `pgvector` extension in PostgreSQL (via `add_vector_and_history` migration) enabling semantic search and AI-driven recommendations

### 🎨 UI / UX
- **Modern Dark Mode Theme** — High-contrast, cinematic design with Tailwind CSS
- **Responsive Grid Layout** — Video cards that adapt dynamically to all screen sizes
- **Navigation Architecture** — Top nav bar (search, avatar, actions) + collapsible sidebar
- **State Management** — Client-side data fetching via React Hooks (`useState`, `useEffect`) and Axios

### ⚙️ Infrastructure & System Architecture
- **Decoupled Monorepo** — Clean separation between the Next.js client, Express server, and load balancer
- **Relational Database** — PostgreSQL on Supabase, accessed via Prisma ORM
- **Custom Layer 7 Load Balancer** — A fully custom Node.js reverse proxy for horizontal backend scaling, featuring:
  - **Round-Robin Routing** — Distributes traffic evenly across multiple backend instances
  - **Active Health Checking** — Automated node pinging to detect failures and remove dead servers from the pool
  - **Secure Proxying** — Forwards traffic securely to HTTPS backend nodes while stripping duplicate headers
  - **Graceful Degradation** — Custom 502 Bad Gateway handling to prevent crashes on node failure

---

## 🛠️ Local Development Setup

You'll need **Node.js** and an active **PostgreSQL** database (e.g. Supabase).

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/streamit.git
cd streamit
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=4000
DATABASE_URL="your_supabase_connection_string"
DIRECT_URL="your_supabase_direct_url"
JWT_SECRET="your_super_secret_key"
FRONTEND_URL="http://localhost:3000"
```

Run migrations and start the server:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Setup the Frontend

```bash
cd client
npm install
```

Create a `.env.local` file in `/client`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Start the dev server:

```bash
npm run dev
```

App runs at **http://localhost:3000**

---

## 🌐 Production Deployment

| Service | Platform |
|---|---|
| Frontend (`/client`) | [Vercel](https://vercel.com) |
| Backend APIs (`/server`) | [Render](https://render.com) — 2 horizontally scaled Web Services |
| Load Balancer (`/balancer`) | [Render](https://render.com) — Node.js Web Service |

Cross-origin cookies and CORS are pre-configured for cross-domain production environments.

---

## 🏗️ Load Balancer (Local Scaling)

StreamIt ships with a custom Layer 7 Node.js reverse proxy for horizontal backend scaling. Run multiple server instances and the load balancer will:

1. Distribute traffic via **round-robin**
2. **Health-check** all nodes on an interval
3. Automatically **remove failing nodes** from the pool
4. **Securely proxy** traffic to HTTPS backend nodes
5. Return clean **502 errors** on full pool failure

---

## 📄 License

MIT