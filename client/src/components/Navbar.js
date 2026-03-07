'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

function VelocityLogo() {
  return (
    <svg
      width="148"
      height="36"
      viewBox="0 0 148 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="StreamIt"
    >
      <defs>
        <linearGradient id="vel-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E50914" />
          <stop offset="100%" stopColor="#FF4500" />
        </linearGradient>
      </defs>

      {/* Icon box */}
      <rect width="32" height="36" rx="5" fill="#0f0f0f" />

      {/* Three speed slashes */}
      <line x1="7"  y1="27" x2="16" y2="9"  stroke="url(#vel-grad)" strokeWidth="3"   strokeLinecap="round" />
      <line x1="14" y1="27" x2="23" y2="9"  stroke="url(#vel-grad)" strokeWidth="3"   strokeLinecap="round" opacity="0.6" />
      <line x1="21" y1="27" x2="30" y2="9"  stroke="url(#vel-grad)" strokeWidth="3"   strokeLinecap="round" opacity="0.25" />

      {/* Wordmark — stacked */}
      <text
        x="40" y="22"
        fontFamily="'Impact', 'Arial Narrow', sans-serif"
        fontSize="20"
        fontWeight="900"
        fill="white"
        letterSpacing="0.5"
      >
        STREAM
      </text>
      <text
        x="41" y="33"
        fontFamily="'Impact', 'Arial Narrow', sans-serif"
        fontSize="9"
        fontWeight="400"
        fill="#E50914"
        letterSpacing="7.5"
      >
        IT
      </text>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2} stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth={2.5} stroke="currentColor" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* ── Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');

        .si-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #080808;
          border-bottom: 1px solid #1c1c1c;
          /* Subtle red glow line at very bottom */
          box-shadow: 0 1px 0 0 rgba(229,9,20,0.35);
          font-family: 'Barlow Condensed', sans-serif;
        }

        .si-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Logo */
        .si-logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          text-decoration: none;
          transition: opacity 0.15s;
        }
        .si-logo:hover { opacity: 0.85; }

        /* Search */
        .si-search {
          flex: 1;
          max-width: 540px;
          display: flex;
          align-items: center;
        }
        @media (max-width: 640px) { .si-search { display: none; } }

        .si-search form {
          display: flex;
          width: 100%;
          border-radius: 4px;
          overflow: hidden;
          border: 1.5px solid #2a2a2a;
          transition: border-color 0.2s;
        }
        .si-search form.focused {
          border-color: #E50914;
          box-shadow: 0 0 0 2px rgba(229,9,20,0.15);
        }

        .si-search input {
          flex: 1;
          background: #111;
          border: none;
          outline: none;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          letter-spacing: 0.03em;
          padding: 9px 16px;
        }
        .si-search input::placeholder { color: #555; }

        .si-search button {
          background: #181818;
          border: none;
          border-left: 1px solid #2a2a2a;
          color: #777;
          padding: 0 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.15s, color 0.15s;
        }
        .si-search button:hover { background: #E50914; color: #fff; }

        /* Right actions */
        .si-actions {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* Icon button */
        .si-icon-btn {
          background: transparent;
          border: none;
          color: #888;
          width: 38px;
          height: 38px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .si-icon-btn:hover { background: #1a1a1a; color: #fff; }

        /* Create button */
        .si-create {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #1a1a1a;
          border: 1px solid #2d2d2d;
          color: #ccc;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 16px;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .si-create:hover {
          background: #E50914;
          border-color: #E50914;
          color: #fff;
        }
        .si-create-label { display: none; }
        @media (min-width: 900px) { .si-create-label { display: inline; } }

        /* Divider */
        .si-divider {
          width: 1px;
          height: 28px;
          background: #222;
          flex-shrink: 0;
          margin: 0 4px;
        }

        /* Avatar */
        .si-avatar {
          width: 34px;
          height: 34px;
          border-radius: 3px;
          background: #E50914;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Impact', sans-serif;
          font-size: 16px;
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          transition: box-shadow 0.15s;
          flex-shrink: 0;
        }
        .si-avatar:hover { box-shadow: 0 0 0 2px #E50914, 0 0 0 4px rgba(229,9,20,0.2); }

        /* Logout */
        .si-logout {
          background: transparent;
          border: none;
          color: #555;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 3px;
          transition: color 0.15s, background 0.15s;
        }
        .si-logout:hover { color: #fff; background: #1a1a1a; }
        @media (max-width: 640px) { .si-logout { display: none; } }

        /* Auth links */
        .si-login {
          color: #aaa;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 3px;
          transition: color 0.15s;
        }
        .si-login:hover { color: #fff; }

        .si-signup {
          background: #E50914;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 8px 20px;
          border-radius: 4px;
          transition: background 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .si-signup:hover {
          background: #c0000f;
          box-shadow: 0 0 16px rgba(229,9,20,0.4);
        }
      `}</style>

      <nav className="si-nav">
        <div className="si-inner">

          {/* Logo */}
          <Link href="/" className="si-logo">
            <VelocityLogo />
          </Link>

          {/* Search */}
          <div className="si-search">
            <form
              onSubmit={handleSearch}
              className={focused ? 'focused' : ''}
            >
              <input
                type="text"
                placeholder="Search videos, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Search"
              />
              <button type="submit" title="Search">
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Right-side actions */}
          <div className="si-actions">
            {authUser ? (
              <>
                {/* Watch History */}
                <Link
                  href="/history"
                  className="si-icon-btn"
                  title="Watch History"
                >
                  <HistoryIcon />
                </Link>

                {/* Create */}
                <Link href="/upload" className="si-create">
                  <PlusIcon />
                  <span className="si-create-label">Create</span>
                </Link>

                <div className="si-divider" />

                {/* Avatar */}
                <Link href="/profile" className="si-avatar" title="Profile">
                  {authUser.name?.charAt(0).toUpperCase() || 'U'}
                </Link>

                {/* Logout */}
                <button onClick={handleLogout} className="si-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="si-login">Log in</Link>
                <Link href="/signup" className="si-signup">Sign up</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  );
}