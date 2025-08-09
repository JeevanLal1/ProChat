import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { HOST } from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useState } from "react";
import { ChromePicker } from "react-color";
import { FaPalette } from "react-icons/fa";

const ChatHeader = ({ typingUsers = [], onThemeChange, themeColor }) => {
  const {
    selectedChatData,
    closeChat,
    selectedChatType,
    onlineUsers = [],
    userInfo,
  } = useAppStore();

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
      .map((u) => (u.userId === userInfo?.id ? "You" : u.firstName ?? "Someone"))
      .join(", ");
    const verb = typingUsers.length > 1 ? "are" : "is";
    return `${names} ${verb} typing...`;
  })();

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex flex-wrap items-center justify-between px-4 sm:px-6 md:px-10 lg:px-20 relative gap-y-3">
      {/* Left side */}
      <div className="flex gap-3 sm:gap-5 items-center flex-shrink min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex items-center justify-center">
          {selectedChatType === "contact" ? (
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
              {selectedChatData?.image ? (
                <AvatarImage
                  src={`${HOST}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              ) : (
                <div
                  className={`uppercase w-full h-full text-sm sm:text-lg border ${getColor(
                    selectedChatData?.color
                  )} flex items-center justify-center rounded-full`}
                >
                  {selectedChatData?.firstName
                    ? selectedChatData.firstName[0]
                    : selectedChatData?.email?.[0] ?? ""}
                </div>
              )}
            </Avatar>
          ) : (
            <div className="bg-[#ffffff22] py-2 px-4 sm:py-3 sm:px-5 flex items-center justify-center rounded-full">
              #
            </div>
          )}
        </div>

        <div className="truncate">
          <div className="font-semibold text-white flex items-center gap-2 sm:gap-3">
            {selectedChatType === "channel" && selectedChatData?.name}
            {selectedChatType === "contact" &&
            selectedChatData?.firstName &&
            selectedChatData?.lastName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : ""}

            {selectedChatType === "contact" && (
              <span
                title={isOnline ? "Online" : "Offline"}
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            )}
          </div>

          {typingMessage ? (
            <div className="text-xs text-neutral-400 truncate">
              {typingMessage}
            </div>
          ) : selectedChatType === "contact" ? (
            <div
              className={`text-xs ${
                isOnline ? "text-green-400" : "text-neutral-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-5 relative">
        <button
          className="text-neutral-300 hover:text-yellow-400 transition-all duration-300"
          onClick={() => setShowPicker((prev) => !prev)}
          aria-label="Theme picker"
        >
          <FaPalette className="text-xl sm:text-2xl" />
        </button>

        {showPicker && (
          <div className="absolute top-12 right-0 sm:right-12 z-50">
            <ChromePicker color={themeColor} onChange={handleColorChange} />
          </div>
        )}

        <button
          className="text-neutral-300 hover:text-red-600 transition-all duration-300"
          onClick={closeChat}
          aria-label="Close chat"
        >
          <RiCloseFill className="text-2xl sm:text-3xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
