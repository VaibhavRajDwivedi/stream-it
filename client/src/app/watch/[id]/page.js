'use client'; 

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation'; 
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react'; // External icon library
import useVideoStore from '@/store/useVideoStore'; 
import { useAuthStore } from '@/store/useAuthStore';
import RecommendationFeed from '@/components/RecommendationFeed';

export default function WatchPage() {
  const params = useParams(); 
  const videoId = params.id;

  // Mounts global application state descriptors
  const { 
    fetchVideoById, 
    fetchComments, 
    postComment, 
    logWatchHistory,
    logVideoView,          
    fetchVideoReactions,   
    reactToVideo           
  } = useVideoStore();
  
  const { authUser } = useAuthStore();
  
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  // Binds relational boolean logic
  const [reactionStats, setReactionStats] = useState({ likes: 0, dislikes: 0, userReaction: null });

  // Mitigates duplicate React Strict Mode invocations
  const hasLoggedHistory = useRef(false);
  const hasLoggedView = useRef(false);

  // Triggers primary instantiation data load
  useEffect(() => {
    if (!videoId) return;

    const loadData = async () => {
      const videoData = await fetchVideoById(videoId);
      const commentsData = await fetchComments(videoId);
      const reactionData = await fetchVideoReactions(videoId);
      
      setReactionStats(reactionData);
      setVideo(videoData);
      setComments(commentsData);
      setLoading(false);
    };

    loadData();
  }, [videoId, fetchVideoById, fetchComments, fetchVideoReactions]);

  // Enforces immutable chronological view tracking
  useEffect(() => {
    if (videoId && authUser && !hasLoggedHistory.current) {
      logWatchHistory(videoId);
      hasLoggedHistory.current = true;
    }
  }, [videoId, authUser, logWatchHistory]);

  // Records absolute entity hit rate
  useEffect(() => {
    if (videoId && !hasLoggedView.current) {
      logVideoView(videoId);
      hasLoggedView.current = true; 
    }
  }, [videoId, logVideoView]);

  // Coordinates optimistic UI updates for relational inputs
  const handleReaction = async (type) => {
    if (!authUser) return alert("You must be logged in to react to this video.");

    // Dispatches predictive interface updates immediately
    setReactionStats((prev) => {
      let newLikes = prev.likes;
      let newDislikes = prev.dislikes;
      let newReaction = type;

      if (prev.userReaction === type) {
        // Disables active relation
        newReaction = null;
        if (type === "LIKE") newLikes -= 1;
        if (type === "DISLIKE") newDislikes -= 1;
      } else {
        // Enables logical switch between exclusive relation constants
        if (type === "LIKE") {
          newLikes += 1;
          if (prev.userReaction === "DISLIKE") newDislikes -= 1;
        } else {
          newDislikes += 1;
          if (prev.userReaction === "LIKE") newLikes -= 1;
        }
      }

      return { likes: newLikes, dislikes: newDislikes, userReaction: newReaction };
    });

    // Dispatches authoritative structural state changes remotely
    await reactToVideo(videoId, type);
  };

  // Mounts new text node relation
  const handleAddComment = async (e) => {
    e.preventDefault(); 
    if (!newCommentText.trim()) return; 

    if (!authUser) return alert("You must be logged in to comment.");

    const addedComment = await postComment(videoId, authUser.id, newCommentText);
    
    if (addedComment) {
      const commentWithUser = { ...addedComment, user: { name: authUser.name || "You" } };
      setComments([commentWithUser, ...comments]);
      setNewCommentText(""); 
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading video... 🍿</div>;
  if (!video) return <div className="p-10 text-center text-red-500">Video not found 😢</div>;

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <div className="p-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left column logical layout boundary */}
        <div className="flex-1 overflow-hidden">
          
          {/* Navigational back-step node */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 px-3 py-2 rounded-xl transition-all mb-4 w-fit font-medium text-sm border border-transparent hover:border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>

          {/* Responsive dynamic video container */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
            {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
              <iframe
                width="100%"
                height="100%"
                src={
                  video.videoUrl.includes('youtube.com') 
                    ? `https://www.youtube.com/embed/${video.videoUrl.split('v=')[1]?.split('&')[0]}`
                    : `https://www.youtube.com/embed/${video.videoUrl.split('/').pop()}`
                }
                title={video.title}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            ) : (
              <video controls autoPlay className="w-full h-full">
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
          
          {/* Analytics node segment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 mb-4 gap-4">
            
            {/* Relation count map */}
            <div className="flex items-center text-gray-400 text-sm gap-4">
              <p>Uploaded by <span className="font-semibold text-white">{video.user?.name}</span></p>
              <p>•</p>
              <p>{video.views || 0} views</p>
            </div>

            {/* Reaction inputs wrapper */}
            <div className="flex bg-zinc-800 rounded-full overflow-hidden shadow-sm">
              <button 
                onClick={() => handleReaction("LIKE")}
                className={`px-5 py-2 flex items-center gap-2 hover:bg-zinc-700 transition font-medium text-sm
                  ${reactionStats.userReaction === "LIKE" ? "text-white bg-zinc-700" : "text-zinc-300"}
                `}
              >
                <ThumbsUp 
                  className="w-5 h-5" 
                  fill={reactionStats.userReaction === "LIKE" ? "currentColor" : "none"} 
                />
                {reactionStats.likes}
              </button>
              
              <div className="w-px bg-zinc-700 my-2"></div>
              
              <button 
                onClick={() => handleReaction("DISLIKE")}
                className={`px-5 py-2 flex items-center gap-2 hover:bg-zinc-700 transition font-medium text-sm
                  ${reactionStats.userReaction === "DISLIKE" ? "text-white bg-zinc-700" : "text-zinc-300"}
                `}
              >
                <ThumbsDown 
                  className="w-5 h-5" 
                  fill={reactionStats.userReaction === "DISLIKE" ? "currentColor" : "none"} 
                />
                {reactionStats.dislikes > 0 ? reactionStats.dislikes : ""}
              </button>
            </div>
          </div>

          {/* Temporal structural metadata */}
          <div className="mt-4 bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
            <p className="text-sm font-semibold text-white mb-2">
              Published on {new Date(video.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">
              {video.description ? video.description : "No description provided."}
            </p>
          </div>

          {/* String interaction segment */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6">Comments</h3>
            
            <form onSubmit={handleAddComment} className="mb-8 flex gap-3">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 border bg-zinc-900 border-zinc-700 text-white placeholder-zinc-400 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-red-600 text-white px-6 rounded-lg font-semibold hover:bg-red-700 transition shadow-sm"
              >
                Comment
              </button>
            </form>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-zinc-400 italic">No comments yet. Be the first to start the conversation!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-sm">
                    <p className="font-bold text-sm text-zinc-100 mb-1">{comment.user?.name || "Unknown User"}</p>
                    <p className="text-zinc-300">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column embedding map tree */}
        <div className="w-full lg:w-100 shrink-0">
          <div className="sticky top-6">
            <RecommendationFeed currentVideoId={videoId} />
          </div>
        </div>
      
      </div>
    </div>
  );
}