import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

interface User {
    _id: string;
    username: string;
    profilePic?: string;
}

interface Message {
    _id: string;
    text?: string;
    senderId: string;
    image?: string;
    createdAt: string;
    receiverId: string;
}

interface ChatStore {
    messages: Message[];
    users: any;
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: FormData) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setSelectedUser: (selectedUser: User | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get<{ data: User[] }>("/messages/side-user-list");
            set({ users: res?.data });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get<{ messagesList: Message[] }>(`/messages/${userId}`);
            set({ messages: res.data.messagesList });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData: FormData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            console.error("No user selected to send the message.");
            return;
        }

        try {
            const res = await axiosInstance.post<{ message: Message }>(`/messages/send/${selectedUser._id}`, messageData, {
                headers: { "Content-Type": "multipart/form-data", },
            }
            );
            set({ messages: [...messages, res.data.message] });
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || "An error occurred while sending the message.");
        }
    },


    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
        socket.on("newMessage", (newMessage: Message) => {
            const { messages } = get();
            if (
                newMessage.senderId === selectedUser._id ||
                newMessage.receiverId === selectedUser._id
            ) {
                set({ messages: [...messages, newMessage] });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
        } else {
            console.warn("Socket is not initialized. Skipping unsubscribe.");
        }
    },

    setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));
