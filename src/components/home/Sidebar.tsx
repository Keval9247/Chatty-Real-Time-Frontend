import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import SidebarSkeleton from "./skeleton/Sidebarskeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

function Sidebar() {
    const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading }: any = useChatStore();
    const { authUser, onlineUsers }: any = useAuthStore();

    const [showOnlineOnly, setShowOnlineOnly] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    // Filter users based on online status
    const filteredUsers = showOnlineOnly
        ? users?.users?.filter((user: any) => onlineUsers.includes(user._id))
        : users?.users || [];

    // Handle user profile image
    const handleUserImage = (userprofilepic: any) => {
        if (userprofilepic?.includes("uploads/updatedImages")) {
            return `${import.meta.env.VITE_API_BASE_URL}/${userprofilepic}`;
        }
        return "/images/avatar.png";
    };

    if (isUsersLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            {/* Header */}
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>
                {/* Online filter toggle */}
                <div className="mt-3 hidden lg:flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showOnlineOnly}
                            onChange={(e) => setShowOnlineOnly(e.target.checked)}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                    </label>
                    <span className="text-xs text-zinc-500">
                        ({onlineUsers?.filter((id: string) => id !== authUser?._id).length - 1} online)
                    </span>
                </div>
            </div>

            {/* User List */}
            <div className="overflow-y-auto w-full py-3">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any) => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user?._id ? "bg-base-300 ring-1 ring-base-300" : ""
                                }`}
                        >
                            {/* User avatar */}
                            <div className="relative mx-auto lg:mx-0">
                                <img
                                    src={handleUserImage(user?.profilePic)}
                                    alt={user?.username}
                                    className="size-12 object-cover rounded-full"
                                />
                                {onlineUsers?.includes(user?._id) && (
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                                )}
                            </div>

                            {/* User info - visible on larger screens */}
                            <div className="hidden lg:block text-left min-w-0">
                                <div className="font-medium truncate">{user?.username}</div>
                                <div className="text-sm text-zinc-400">
                                    {onlineUsers?.includes(user?._id) ? "Online" : "Offline"}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    // Empty state
                    <div className="text-center text-zinc-500 py-4">
                        {showOnlineOnly ? "No online users" : "No users available"}
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
