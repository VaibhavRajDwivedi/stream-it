'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useVideoStore from '@/store/useVideoStore';
import { useAuthStore } from '@/store/useAuthStore';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

// Number of skeleton cards to show — matches the typical grid fill
const SKELETON_COUNT = 12;

export default function Home() {
  const fetchHomeFeed = useVideoStore((state) => state.fetchHomeFeed);
  const authUser = useAuthStore((state) => state.authUser);
  const router = useRouter();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track how many thumbnails have finished loading
  const [loadedCount, setLoadedCount] = useState(0);
  const lastFetchedUser = useRef(undefined);

  const allThumbsLoaded = !loading && loadedCount >= videos.length && videos.length > 0;
  const showSkeleton = loading || (!allThumbsLoaded && videos.length > 0);

  useEffect(() => {
    const currentUserId = authUser?.id || null;
    if (lastFetchedUser.current === currentUserId) return;
    lastFetchedUser.current = currentUserId;

    const loadFeed = async () => {
      setLoading(true);
      setLoadedCount(0);
      const data = await fetchHomeFeed();
      setVideos(data || []);
      setLoading(false);
    };

    loadFeed();
  }, [authUser, fetchHomeFeed]);

  const handleThumbLoad = () => {
    setLoadedCount((c) => c + 1);
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          {authUser ? 'Recommended for You' : 'Trending Now'}
        </h1>

        {/* ── Skeleton grid ── */}
        {showSkeleton && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Real grid — hidden (but rendered) until all thumbs load ── */}
        {!loading && videos.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            style={{ display: showSkeleton ? 'none' : 'grid' }}
          >
            {videos.map((video) => (
              <Link href={`/watch/${video.id}`} key={video.id}>
                <div className="group cursor-pointer">

                  <div className="relative w-full aspect-video mb-3 bg-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onLoad={handleThumbLoad}
                      onError={handleThumbLoad} // Count errors too so grid isn't stuck
                    />
                  </div>

                  <div className="flex gap-3 pr-2">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center font-bold text-sm mt-1">
                      {(video.userName || video.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="text-base font-semibold leading-tight mb-1 line-clamp-2 text-white group-hover:text-zinc-300 transition-colors">
                        {video.title}
                      </h2>
                      <p className="text-zinc-400 text-sm">
                        {video.userName || video.user?.name || 'Unknown Creator'}
                      </p>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && videos.length === 0 && (
          <p className="text-zinc-500">No videos found. Upload something!</p>
        )}

      </div>
    </div>
  );
}