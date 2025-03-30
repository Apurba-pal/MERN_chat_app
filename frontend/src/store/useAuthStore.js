import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: JSON.parse(localStorage.getItem("authUser")) || null, // Load authUser from localStorage
  isSigningUp: false,
  isLoggingin: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("auth/check", { withCredentials: true }); // Ensure cookies are sent
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Persist authUser in localStorage
    } catch (error) {
      console.log("error in checkAuth", error);
      set({ authUser: null });
      localStorage.removeItem("authUser"); // Clear authUser from localStorage on failure
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else {
        toast.error("Failed to check authentication.");
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Persist authUser in localStorage
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingin: true });
    try {
      const res = await axiosInstance.post("auth/login", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Persist authUser in localStorage
      toast.success("Login Success");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Login failed");
    } finally {
      set({ isLoggingin: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("authUser"); // Clear authUser from localStorage on logout
      toast.success("Logout Success");
    } catch (error) {
      toast.error(error.response?.data?.msg || "logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, { withCredentials: true });
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Persist updated authUser in localStorage
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in updating profile: ", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
