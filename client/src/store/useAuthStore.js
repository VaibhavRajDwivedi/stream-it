import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast"; // External visual feedback element

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true, // Forces initial load gating
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,

  checkAuth: async () => {
    console.log('[AuthStore] checkAuth() called — stack:', new Error().stack?.split('\n').slice(1, 4).join(' | '));
    try {
      set({ isCheckingAuth: true });
      console.log('[AuthStore] checkAuth: set isCheckingAuth=true');
      const res = await axiosInstance.get("/auth/check");
      console.log('[AuthStore] checkAuth: /auth/check response received, setting authUser:', res.data?.id);
      set({ authUser: res.data });
    } catch (error) {
      console.log(`[AuthStore] checkAuth: Error — ${error.response?.status} ${error.message}`);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
      console.log('[AuthStore] checkAuth: set isCheckingAuth=false (done)');
    }
  },

  signup: async (formData) => {
    console.log('[AuthStore] signup() called');
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      console.log('[AuthStore] signup: success, authUser:', res.data?.id);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      console.error('[AuthStore] signup: FAILED —', error.response?.status, error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Successfully Logged in");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged Out Successfully");
      set({ authUser: null });
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },
}));