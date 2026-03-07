'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // Extracts structural filter attribute
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Relays remote index lookup
        const res = await axiosInstance.get(`/videos/search?q=${query}`);
        setResults(res.data);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <div className="p-10 text-center text-white">Searching... 🔍</div>;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">
        Search results for: <span className="text-red-500">"{query}"</span>
      </h1>

      {results.length === 0 ? (
        <p className="text-zinc-500 text-lg">No videos found. Try a different keyword!</p>
      ) : (
        <div className="flex flex-col gap-6 max-w-5xl">
          {results.map((video) => (
            <Link href={`/watch/${video.id}`} key={video.id}>
              <div className="flex flex-col md:flex-row gap-4 group cursor-pointer hover:bg-zinc-900 p-2 rounded-xl transition">
                
                {/* Asset layout wrapper */}
                <div className="w-full md:w-90 shrink-0 aspect-video bg-zinc-800 rounded-xl overflow-hidden relative">
                  {video.thumbnailUrl && (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                    />
                  )}
                </div>

                {/* Descriptive string tree */}
                <div className="flex flex-col pt-1">
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {video.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-zinc-400 text-sm">
                    <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white text-xs">
                      {video.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <p>{video.user?.name}</p>
                  </div>
                  <p className="mt-3 text-zinc-500 text-sm line-clamp-2">
                    {video.description || "No description provided."}
                  </p>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}