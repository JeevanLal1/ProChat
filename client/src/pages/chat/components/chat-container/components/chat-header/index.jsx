import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { getAssetUrl, DELETE_CHANNEL } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { FaPalette, FaTrash } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import apiClient from "@/lib/api-client";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

const ChatHeader = ({ typingUsers = [], onThemeChange, themeColor }) => {
  const {
    selectedChatData,
    closeChat,
    selectedChatType,
    onlineUsers = [],
    userInfo,
  } = useAppStore();

  const socket = useSocket();

  const handleDeleteChannel = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the channel "${selectedChatData.name}"? This will delete all messages and cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const response = await apiClient.delete(
        `${DELETE_CHANNEL}/${selectedChatData._id}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        socket.emit("delete-channel-notify", {
          channelId: selectedChatData._id,
          members: selectedChatData.members,
        });
        closeChat();
        toast.success("Channel deleted successfully.");
      }
    } catch (error) {
      console.error("Failed to delete channel:", error);
      toast.error("Failed to delete channel.");
    }
  };

  const otherId = selectedChatData?._id ?? selectedChatData?.id ?? null;
  const isOnline =
    selectedChatType === "contact" &&
    otherId &&
    onlineUsers?.some((id) => id?.toString() === otherId?.toString());

  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (newColor) => {
    if (onThemeChange) onThemeChange(newColor.hex);
  };

  const typingMessage = (() => {
    if (!typingUsers || typingUsers.length === 0) return "";
    if (typingUsers.length === 1 && typingUsers[0].userId === userInfo?.id) {
      return "You are typing...";
    }
    const names = typingUsers
      .map((u) => (u.userId === userInfo?.id ? "You" : u.firstName || "Someone"))
      .join(", ");
    const verb = typingUsers.length > 1 ? "are" : "is";
    return `${names} ${verb} typing...`;
  })();

  return (
    <div className="h-[10vh] border-b border-[#2f303b] flex items-center justify-between px-4 sm:px-6 md:px-10 relative">
      {/* Left side */}
      <div className="flex gap-2 sm:gap-4 items-center flex-shrink min-w-0">
        <button
          className="md:hidden block text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 mr-1"
          onClick={closeChat}
          aria-label="Back to contacts"
        >
          <IoArrowBack className="text-2xl" />
        </button>
        
        <div className="w-9 h-9 sm:w-11 sm:h-11 relative flex items-center justify-center">
          {selectedChatType === "contact" ? (
            <Avatar className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
              {selectedChatData?.image ? (
                <AvatarImage
                  src={getAssetUrl(selectedChatData.image)}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              ) : (
                <div
                  className={`uppercase w-full h-full text-xs sm:text-base border ${getColor(
                    selectedChatData?.color
                  )} flex items-center justify-center rounded-full font-semibold`}
                >
                  {selectedChatData?.firstName
                    ? selectedChatData.firstName[0]
                    : selectedChatData?.email?.[0] ?? ""}
                </div>
              )}
            </Avatar>
          ) : (
            <div className="bg-[#ffffff22] text-sm sm:text-base h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center rounded-full font-light text-neutral-300">
              #
            </div>
          )}
        </div>

        <div className="truncate">
          <div className="font-semibold text-white flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            {selectedChatType === "channel" && selectedChatData?.name}
            {selectedChatType === "contact" &&
            selectedChatData?.firstName &&
            selectedChatData?.lastName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData?.firstName || selectedChatData?.email}

            {selectedChatType === "contact" && (
              <span
                title={isOnline ? "Online" : "Offline"}
                className={`w-2.5 h-2.5 rounded-full border border-[#1c1d25] ${
                  isOnline ? "bg-green-500" : "bg-neutral-500"
                }`}
              />
            )}
          </div>

          {typingMessage ? (
            <div className="text-xs text-blue-400 font-medium truncate animate-pulse">
              {typingMessage}
            </div>
          ) : selectedChatType === "contact" ? (
            <div
              className={`text-xs font-medium ${
                isOnline ? "text-green-400" : "text-neutral-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4 relative">
        {selectedChatType === "channel" && selectedChatData?.admin === userInfo.id && (
          <button
            className="text-neutral-400 hover:text-red-500 p-2 rounded-xl hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
            onClick={handleDeleteChannel}
            aria-label="Delete Channel"
            title="Delete Channel"
          >
            <FaTrash className="text-base sm:text-lg" />
          </button>
        )}

        <button
          className="text-neutral-400 hover:text-yellow-500 p-2 rounded-xl hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
          onClick={() => setShowPicker((prev) => !prev)}
          aria-label="Theme picker"
        >
          <FaPalette className="text-lg sm:text-xl" />
        </button>

        {showPicker && (
          <div className="absolute top-12 right-0 sm:right-12 z-50 shadow-2xl rounded-xl border border-white/10 overflow-hidden">
            <ChromePicker color={themeColor} onChange={handleColorChange} />
          </div>
        )}

        <button
          className="text-neutral-400 hover:text-red-500 p-2 rounded-xl hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
          onClick={closeChat}
          aria-label="Close chat"
        >
          <RiCloseFill className="text-xl sm:text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
