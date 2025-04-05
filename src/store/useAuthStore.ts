import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`

interface AuthUser {
    id: string;
    name: string;
    email: string;
    [key: string]: any;
}

interface SignupData {
    name: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
    [key: string]: any;
}

interface AuthStore {
    authUser: AuthUser | null;
    isSigningUp: boolean;
    isLoggedIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: any[];
    socket: any | null;

    checkAuth: () => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (formData: FormData) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set:any, get:any): any => ({
    authUser: null,
    isSigningUp: false,
    isLoggedIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get<AuthUser>('/auth/check');
            set({ authUser: response.data, isCheckingAuth: true });
            get().connectSocket();
        } catch (error) {
            console.error("Error in checkAuth:", error);
            set({ authUser: null, isCheckingAuth: true });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data: SignupData) => {
        try {
            set({ isSigningUp: true });
            const response = await axiosInstance.post<{ message: string; user: AuthUser }>('/auth/signup', data);
            set({ authUser: response.data.user, isLoggedIn: true });
            toast.success(response.data.message);

            get().connectSocket();
        } catch (error) {
            console.error("Error in signup:", error);
            toast.error('Signup failed');
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data: LoginData) => {
        try {
            set({ isLoggedIn: true });
            const response = await axiosInstance.post<{ message: string; user: AuthUser; token: String | any }>('/auth/login', data,
                { withCredentials: true }
            );
            localStorage.setItem("token", response?.data?.token);
            set({ authUser: response.data.user });
            toast.success(response.data.message);

            get().connectSocket();
        } catch (error) {
            console.error("Error in login:", error);
            toast.error('Invalid credentials');
        } finally {
            set({ isLoggedIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null, isLoggedIn: false });
            toast.success('Logout successful');

            get().disconnectSocket()
        } catch (error) {
            console.error("Error in logout:", error);
            toast.error('Failed to logout');
        }
    },

    updateProfile: async (formData: FormData) => {
        try {
            set({ isUpdatingProfile: true });
            const response = await axiosInstance.put<{ message: string; user: AuthUser }>(
                '/auth/update-profile',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            set({ authUser: response.data.user });
            toast.success(response.data.message);
        } catch (error) {
            console.error("Error in updateProfile:", error);
            toast.error('Failed to update profile');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: { userId: authUser?.user?._id, },
        })
        socket.on('connect', () => console.log('Connected to socket:', socket.id));

        set({ socket })

        socket.on("connect_error", (err: any) => console.error("Socket connection error:", err));
        socket.on("newMessage", (message: any) => console.log("Message received:", message));


        socket.on("getOnlineUsers", (usersIds: any) => {
            set({ onlineUsers: usersIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect()
        set({ socket: null })
    },
}));
