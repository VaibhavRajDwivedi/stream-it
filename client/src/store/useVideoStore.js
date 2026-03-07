import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

const useVideoStore = create((set) => ({
  videos: [],
  loading: false,
  error: null,

  // Fetches initial unpaginated array
  fetchVideos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get('/videos');
      
      set({ videos: response.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Fetches singular instantiated node
  fetchVideoById: async (id) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/videos/${id}`);
      
      set({ loading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  fetchComments: async (videoId) => {
    try {
      const response = await axiosInstance.get(`/comments/${videoId}`);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch comments", err);
      return [];
    }
  },

  postComment: async (videoId, userId, text) => {
    try {
      const response = await axiosInstance.post('/comments', { videoId, userId, text });
      return response.data;
    } catch (err) {
      console.error("Failed to post comment", err);
      return null;
    }
  },

  logWatchHistory: async (videoId) => {
    try {
      await axiosInstance.post(`/videos/${videoId}/watch`);
      console.log("Watch history API invoked");
    } catch (error) {
      console.error("Could not log watch history:", error);
    }
  },

  fetchWatchHistory: async () => {
    try {
      const response = await axiosInstance.get(`/videos/history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching watch history:", error);
      return [];
    }
  },

  removeFromHistory: async (videoId) => {
    try {
      await axiosInstance.delete(`/videos/history/${videoId}`);
      return true; // Signals structural operation success
    } catch (error) {
      console.error("Error removing from history:", error);
      return false;
    }
  },

  fetchHomeFeed: async () => {
    try {
      const response = await axiosInstance.get(`/videos/feed`);
      return response.data;
    } catch (error) {
      console.error("Error fetching home feed:", error);
      return [];
    }
  },

  logVideoView: async (videoId) => {
    try {
      await axiosInstance.put(`/videos/${videoId}/view`);
    } catch (error) {
      console.error("Failed to register view:", error);
    }
  },

  fetchVideoReactions: async (videoId) => {
    try {
      const response = await axiosInstance.get(`/videos/${videoId}/reactions`);
      return response.data;
    } catch (error) {
      console.error("Failed to load reactions:", error);
      // Falls back resolving component loading crashes
      return { likes: 0, dislikes: 0, userReaction: null }; 
    }
  },

  reactToVideo: async (videoId, type) => {
    try {
      await axiosInstance.post(`/videos/${videoId}/react`, { type });
    } catch (error) {
      console.error("Failed to save reaction:", error);
    }
  },

  
}));

export default useVideoStore;