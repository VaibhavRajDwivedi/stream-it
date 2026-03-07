'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const router = useRouter();

  const { authUser } = useAuthStore(); 

  const handleUpload = async (e) => {
    e.preventDefault();
    
    // Enforces mandatory input constraints mitigating broken schema injections
    if (!file || !thumbnail || !title) return alert("Please provide a title, a thumbnail, and a video file.");
    if (!authUser) return alert("You must be logged in to upload videos.");

    setUploading(true);
    try {
      // Transmits image blob to cloud bucket
      const thumbExt = thumbnail.name.split('.').pop();
      const thumbName = `thumb_${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
      
      const { error: thumbError } = await supabase.storage
        .from('thumbnails') // Resolves public access object directory
        .upload(thumbName, thumbnail);

      if (thumbError) throw thumbError;

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbName);

      // Transmits video blob to cloud bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Relays physical endpoint resolutions to persistent relational DB
      await axiosInstance.post('/videos', {
        title: title,
        description: description,
        videoUrl: videoUrl,
        thumbnailUrl: thumbUrl, // Passes public image source link
        userId: authUser.id 
      });

      alert("Video published successfully! 🚀");
      router.push('/'); 
      
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-zinc-900 text-white rounded-xl shadow-lg border border-zinc-800">
      <h1 className="text-3xl font-extrabold mb-8 text-red-600">Upload a Video</h1>
      <form onSubmit={handleUpload} className="flex flex-col gap-6">
        
        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Video Title</label>
          <input 
            type="text" 
            placeholder="Give your video a catchy title..." 
            className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 rounded-lg outline-none focus:border-red-500 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Description</label>
          <textarea 
            placeholder="Tell viewers about your video..." 
            rows="4"
            className="w-full bg-zinc-800 text-white border border-zinc-700 p-3 rounded-lg outline-none focus:border-red-500 transition resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Image selection utility node */}
        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Upload Thumbnail (Image)</label>
          <input 
            type="file" 
            accept="image/*" 
            className="w-full border-2 border-dashed border-zinc-700 p-6 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 text-zinc-300 transition"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-400 mb-2">Select Video File</label>
          <input 
            type="file" 
            accept="video/*" 
            className="w-full border-2 border-dashed border-zinc-700 p-6 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 text-zinc-300 transition"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button 
          disabled={uploading}
          className="mt-4 bg-red-600 text-white font-bold py-4 rounded-lg hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 text-lg"
        >
          {uploading ? "Uploading to Cloud..." : "Publish Video"}
        </button>
      </form>
    </div>
  );
}