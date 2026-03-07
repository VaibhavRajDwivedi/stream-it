'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const router = useRouter();
  
  // Binds local string input
  const [searchQuery, setSearchQuery] = useState(''); 

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Dispatches path transition on submission event
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Mutates URL appending parameterized string
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Static quarter-width alignment */}
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white flex items-center gap-1 w-1/4">
          <div className="bg-red-600 text-white px-2 rounded-lg leading-tight">S</div>
          tream<span className="text-zinc-400 font-light text-xl ml-1">It</span>
        </Link>

        {/* Form container centering structure */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white px-5 py-2 rounded-l-full focus:outline-none focus:border-blue-500 transition shadow-inner"
          />
          <button 
            type="submit" 
            className="bg-zinc-800 border border-zinc-700 border-l-0 px-6 py-2 rounded-r-full hover:bg-zinc-700 transition text-zinc-400 flex items-center justify-center"
            title="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </form>
        {/* Ending central form element */}

        {/* Right-aligned flexbox mirroring flex-ratios */}
        <div className="flex items-center justify-end gap-4 w-1/4">
          {authUser ? (
            /* Authenticated node tree */
            <>
              <Link 
                href="/history" 
                className="text-zinc-300 hover:text-white transition hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-zinc-800 mr-1"
                title="Watch History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </Link>

              <Link 
                href="/upload" 
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full transition font-medium border border-zinc-700 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden lg:inline">Create</span>
              </Link>

              <div className="flex items-center gap-4 border-l border-zinc-700 pl-4 ml-2">
                <Link href="/profile" className="cursor-pointer hover:ring-2 hover:ring-red-500 rounded-full transition-all shrink-0">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
                    {authUser.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-white transition font-medium hidden sm:block"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* Unauthenticated node tree */
            <>
              <Link 
                href="/login" 
                className="text-zinc-300 hover:text-white transition font-medium px-2 whitespace-nowrap"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full transition font-medium shadow-md whitespace-nowrap"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}