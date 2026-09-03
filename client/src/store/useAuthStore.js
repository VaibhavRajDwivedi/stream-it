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
    set({ isCheckingAuth: true }); // only 1 set() before the await
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false }); // batch: 1 set() instead of 2
    } catch (error) {
      console.log(`Error in Auth Check: ${error.response?.status} ${error.message}`);
      set({ authUser: null, isCheckingAuth: false }); // batch: 1 set() instead of 2
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data, isSigningUp: false }); // batch to reduce renders
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, isLoggingIn: false }); // batch to reduce renders
      toast.success("Successfully Logged in");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logged Out Successfully");
      set({ authUser: null, isLoggingOut: false }); // batch to reduce renders
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      set({ isLoggingOut: false });
    }
  },
}));