'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { authUser } = useAuthStore();
  const router = useRouter();
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restricts endpoint logic strictly to active sessions
  useEffect(() => {
    if (!authUser) {
      router.push('/login');
      return;
    }

    const fetchMyVideos = async () => {
      try {
        const res = await axiosInstance.get(`/videos/user/${authUser.id}`);
        setMyVideos(res.data);
      } catch (error) {
        console.error("Error fetching profile videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyVideos();
  }, [authUser, router]);

  // Resolves relational deletions
  const handleDelete = async (videoId) => {
    // Enforces deliberate user confirmation mitigating accidental loss
    const confirmDelete = window.confirm("Are you sure you want to delete this video? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      // Relays physical deletion command
      await axiosInstance.delete(`/videos/${videoId}`);
      
      // Drops entity from local memory accelerating visual response
      setMyVideos(myVideos.filter((video) => video.id !== videoId));
      alert("Video deleted successfully.");
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete video.");
    }
  };

  if (loading) return <div className="p-10 text-center text-xl text-white">Loading profile...</div>;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-black text-white">
      {/* Header logic bounds */}
      <div className="flex items-center gap-6 mb-10 border-b border-zinc-800 pb-8">
        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center font-bold text-4xl shadow-lg">
          {authUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-4xl font-extrabold">{authUser?.name}</h1>
          <p className="text-zinc-400 mt-1">{authUser?.email}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">My Videos ({myVideos.length})</h2>

      {myVideos.length === 0 ? (
        <p className="text-zinc-500">You haven't uploaded any videos yet. <Link href="/upload" className="text-red-500 hover:underline">Upload one now!</Link></p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myVideos.map((video) => (
            <div key={video.id} className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              
              <Link href={`/watch/${video.id}`}>
                <div className="w-full aspect-video bg-zinc-800 relative">
                  {video.thumbnailUrl && (
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" 
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white line-clamp-1">{video.title}</h3>
                </div>
              </Link>

              {/* Exposes administrative unmount function */}
              <button 
                onClick={() => handleDelete(video.id)}
                className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Delete Video"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}