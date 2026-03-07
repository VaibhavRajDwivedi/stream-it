'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useVideoStore from '@/store/useVideoStore'; 
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  // Injects logic handlers and session state
  const { fetchHomeFeed } = useVideoStore();
  const { authUser } = useAuthStore();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orchestrates feed generation linked to authentication mutation events
  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      const data = await fetchHomeFeed();
      setVideos(data || []);
      setLoading(false);
    };

    loadFeed();
  }, [authUser, fetchHomeFeed]);

  if (loading) return <div className="p-10 text-center text-xl text-white min-h-screen bg-black">Loading your personalized feed... 🍿</div>;

  return (
    // Enforces strict dark mode constraint
    <div className="p-6 md:p-10 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Status-bound headline rendering */}
        <h1 className="text-2xl font-bold mb-6">
          {authUser ? "Recommended for You" : "Trending Now"}
        </h1>

        {videos.length === 0 ? (
          <p className="text-zinc-500">No videos found. Upload something!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Iterative grid mapping */}
            {videos.map((video) => (
              <Link href={`/watch/${video.id}`} key={video.id}>
                <div className="group cursor-pointer">
                  
                  {/* Image wrapper constraints */}
                  <div className="relative w-full aspect-video mb-3 bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                    />
                  </div>
                  {/* Ends image bounds */}
                  
                  {/* Layout bounding wrapper */}
                  <div className="flex gap-3 pr-2">
                    {/* Fallback graphical string avatar */}
                    <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center font-bold text-sm mt-1">
                      {/* Resolves property extraction between flat SQL maps and ORM relation bindings */}
                      {(video.userName || video.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h2 className="text-base font-semibold leading-tight mb-1 line-clamp-2 text-white group-hover:text-zinc-300 transition-colors">
                        {video.title}
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        {video.userName || video.user?.name || "Unknown Creator"}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}