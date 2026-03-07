'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useVideoStore from '@/store/useVideoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { fetchWatchHistory, removeFromHistory } = useVideoStore(); // Maps bound functions
  const { authUser } = useAuthStore();
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      router.push('/login');
      return;
    }

    const loadHistory = async () => {
      const data = await fetchWatchHistory();
      setHistory(data);
      setLoading(false);
    };

    loadHistory();
  }, [authUser, fetchWatchHistory, router]);

  // Invokes local array trimming and external database propagation
  const handleDelete = async (e, videoId) => {
    e.preventDefault(); // Nullifies native Link propagation
    
    // Flushes index directly mitigating reload requirement
    setHistory((prev) => prev.filter((video) => video.id !== videoId));
    
    // Signals removal across structural scope
    await removeFromHistory(videoId);
  };

  if (loading) return <div className="p-10 text-center text-xl text-white min-h-screen bg-black">Loading history... ⏳</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-zinc-800 pb-4">Watch History</h1>

        {history.length === 0 ? (
          <div className="text-center text-zinc-500 mt-20">
            <p className="text-xl mb-4">You haven't watched any videos yet.</p>
            <Link href="/" className="text-blue-500 hover:underline">
              Go find something to watch!
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((video) => (
              <Link href={`/watch/${video.id}`} key={video.id} className="group relative flex flex-col sm:flex-row gap-4 hover:bg-zinc-900 p-3 rounded-xl transition duration-200 pr-12">
                
                {/* Container scaling boundary */}
                <div className="w-full sm:w-64 h-36 shrink-0 bg-zinc-800 rounded-lg overflow-hidden relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Text flow boundaries */}
                <div className="flex flex-col justify-start py-1">
                  <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-white line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">{video.user?.name}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Watched on {new Date(video.viewedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2 hidden sm:block">
                    {video.description}
                  </p>
                </div>

                {/* Contextual unmount interaction button */}
                <button 
                  onClick={(e) => handleDelete(e, video.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from Watch History"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}