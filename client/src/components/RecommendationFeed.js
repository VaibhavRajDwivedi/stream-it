import { useState, useEffect } from 'react';
import Link from 'next/link';
// Imports singleton client
import {axiosInstance} from '@/lib/axios.js'; 

export default function RecommendationFeed({ currentVideoId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Dispatches targeted identifier payload
        const response = await axiosInstance.get(`/videos/${currentVideoId}/recommendations`);
        setRecommendations(response.data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentVideoId) {
      fetchRecommendations();
    }
  }, [currentVideoId]);

  if (loading) return <div className="animate-pulse text-gray-400 text-sm">Loading AI recommendations...</div>;
  if (recommendations.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <h3 className="text-lg font-bold text-white">Up Next</h3>
      
      <div className="flex flex-col gap-3">
        {recommendations.map((video) => (
          <Link href={`/watch/${video.id}`} key={video.id} className="flex gap-3 group cursor-pointer">
            
            <div className="w-40 h-24 bg-gray-800 rounded-lg overflow-hidden shrink-0 relative">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200" 
              />
            </div>
            
            <div className="flex flex-col flex-1 py-1">
              <h4 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1 hover:text-white transition-colors">
                {video.user.name}
              </p>
            </div>
            
          </Link>
        ))}
      </div>
    </div>
  );
}