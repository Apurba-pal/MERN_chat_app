import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"

export const useAuthStore = create((set)=>({
    authUser : null,
    isSigningUp:false,
    isLoggingin:false,
    isUpdatingProfile:false,
    isCheckingAuth : true,
    checkAuth: async () => {
        try {
            const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
            if (!token) throw new Error("No token found"); // Handle missing token

            const res = await axiosInstance.get("auth/check", {
                headers: { Authorization: `Bearer ${token}` }, // Include token in headers
            });
            set({ authUser: res.data });
        } catch (error) {
            console.log("error in checkAuth", error);
            set({ authUser: null });
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
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response?.data?.msg || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data)=>{
        set({ isLoggingin: true });
        try {
            const res = await axiosInstance.post("auth/login", data);
            set({ authUser: res.data });
            toast.success("Login Success")
        } catch (error) {
            toast.error(error.response?.data?.msg || "Login failed");
        }finally{
            set({ isLoggingin: false });
        }
    },


    logout: async ()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser:null})
            toast.success("Logout Success")
        } catch (error) {
            toast.error(error.response?.data?.msg || "logout failed");
        }
    }
}))