// MessageBar.jsx
import { IoSend } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store";
import { useSocket } from "@/contexts/SocketContext";
import { MESSAGE_TYPES, UPLOAD_FILE } from "@/lib/constants";
import apiClient from "@/lib/api-client";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const typingTimeoutRef = useRef(null);

  const {
    selectedChatData,
    userInfo,
    selectedChatType,
    setIsUploading,
    setFileUploadProgress,
    setTyping,
    clearTyping,
  } = useAppStore();

  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  useEffect(() => {
    if (!socket || !selectedChatData?._id) return;
    socket.emit("joinRoom", {
      chatId: selectedChatData._id,
      isChannel: selectedChatType === "channel",
    });

    return () => {
      if (socket && userInfo?.id && selectedChatData?._id) {
        socket.emit("userStopTyping", {
          typingUserId: userInfo.id,
          recipientId:
            selectedChatType === "contact" ? selectedChatData._id : undefined,
          isChannel: selectedChatType === "channel",
          chatId:
            selectedChatType === "channel" ? selectedChatData._id : undefined,
        });
        clearTyping(selectedChatData._id, userInfo.id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);
    };
  }, [socket, selectedChatData, selectedChatType]);

  const emitTyping = () => {
    if (!socket || !selectedChatData) return;
    socket.emit("userTyping", {
      typingUserId: userInfo.id,
      recipientId:
        selectedChatType === "contact" ? selectedChatData._id : undefined,
      firstName: userInfo.firstName,
      isChannel: selectedChatType === "channel",
      chatId:
        selectedChatType === "channel" ? selectedChatData._id : undefined,
    });
  };

  const emitStopTyping = () => {
    if (!socket || !selectedChatData) return;
    socket.emit("userStopTyping", {
      typingUserId: userInfo.id,
      recipientId:
        selectedChatType === "contact" ? selectedChatData._id : undefined,
      isChannel: selectedChatType === "channel",
      chatId:
        selectedChatType === "channel" ? selectedChatData._id : undefined,
    });
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
    if (!socket || !selectedChatData) return;

    setTyping(selectedChatData._id, userInfo.id);

    if (!isTyping) {
      setIsTyping(true);
      emitTyping();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping();
      clearTyping(selectedChatData._id, userInfo.id);
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (isTyping) {
      emitStopTyping();
      clearTyping(selectedChatData._id, userInfo.id);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: MESSAGE_TYPES.TEXT,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: MESSAGE_TYPES.TEXT,
        channelId: selectedChatData._id,
      });
    }

    setMessage("");
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);

      const response = await apiClient.post(UPLOAD_FILE, formData, {
        withCredentials: true,
        onUploadProgress: (data) => {
          setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
        },
      });

      if (response.status === 200 && response.data) {
        setIsUploading(false);
        if (selectedChatType === "contact") {
          socket.emit("sendMessage", {
            sender: userInfo.id,
            messageType: MESSAGE_TYPES.FILE,
            fileUrl: response.data.filePath,
            recipient: selectedChatData._id,
          });
        } else if (selectedChatType === "channel") {
          socket.emit("send-channel-message", {
            sender: userInfo.id,
            messageType: MESSAGE_TYPES.FILE,
            fileUrl: response.data.filePath,
            channelId: selectedChatData._id,
          });
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
  <div className="fixed bottom-4 translate-x-1 mr-2 z-50 flex items-center gap-2 bg-transparent w-full px-2">
    <div className="flex items-center gap-2 px-4 rounded-md bg-[#2d2e30]/80 backdrop-blur-md 
                    w-[90vw] sm:w-[70vw] md:w-[60vw] lg:w-[75vw] h-14">
      <input
        type="text"
        className="flex-1 text-base sm:text-lg bg-transparent text-white placeholder-gray-400 outline-none"
        placeholder="Enter message"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSendMessage();
        }}
      />

      {/* Attachment Button */}
      <button
        className="text-neutral-300 hover:text-white"
        onClick={handleAttachmentClick}
      >
        <GrAttachment className="text-lg sm:text-xl" />
      </button>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleAttachmentChange}
      />

        
      <div className="relative">
        <button
          className="text-neutral-300 hover:text-white"
          onClick={() => setEmojiPickerOpen((s) => !s)}
        >
          <RiEmojiStickerLine className="text-lg sm:text-xl" />
        </button>
        {emojiPickerOpen && (
          <div
            className="absolute bottom-12 right-0 z-50"
            ref={emojiRef}
          >
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        )}
      </div>
    </div>

    {/* Send Button */}
    <button
      className="bg-[#3661c6e2] rounded-md h-14 w-14 flex items-center justify-center hover:bg-[#2540acdf] focus:bg-[#1b54da] transition-all duration-300"
      onClick={handleSendMessage}
    >
      <IoSend className="text-xl" />
    </button>
  </div>
);

};

export default MessageBar;
