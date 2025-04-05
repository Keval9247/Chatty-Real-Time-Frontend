import { useEffect, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessegeInput from "./MessegeInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { formatMessageTime } from "../../lib/utils/dateFormater";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  }: any = useChatStore();

  const { authUser }: any = useAuthStore();
  const messageEndRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      // Cleanup on component unmount or user change
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef?.current && messages?.length > 0) {
      messageEndRef?.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessegeInput />
      </div>
    );
  }

  const handleUserImage = (userprofilepic: string) => {
    if (userprofilepic?.includes("updatedImages")) {
      return `${import.meta.env.VITE_API_BASE_URL}/${userprofilepic}`;
    } else {
      return "/images/avatar.png";
    }
  };

  const handleChatImages = (ChatImage: string) => {
    if (ChatImage?.includes("uploads/chatImages")) {
      const image = `${import.meta.env.VITE_API_BASE_URL}${ChatImage}`
      return image
    } else {
      return "/images/invalid.png";
    }
  }


  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message: any) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser.user?._id ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser?.user?._id
                      ? handleUserImage(selectedUser?.profilePic)
                      : handleUserImage(authUser?.user?.profilePic)
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message?.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={handleChatImages(message.image)}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messageEndRef}></div>
      </div>

      <MessegeInput />
    </div>
  );
};

export default ChatContainer;
