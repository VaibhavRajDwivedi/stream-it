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
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const router = useRouter();

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags([...tags, val]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

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
        userId: authUser.id,
        tags: tags, // Sends normalised tag array
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-zinc-400">Tags</label>
            <span className="text-xs text-zinc-600">{tags.length}/10</span>
          </div>
          <div className="w-full min-h-[48px] bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex flex-wrap gap-2 focus-within:border-red-500 transition">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-zinc-400 hover:text-white leading-none transition"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "e.g. music, vlog — press Enter to add" : ""}
              disabled={tags.length >= 10}
              className="flex-1 min-w-[160px] bg-transparent text-white text-sm outline-none placeholder-zinc-600 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">Press Enter or comma to add a tag. Backspace removes the last one.</p>
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