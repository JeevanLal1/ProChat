// MessageContainer.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/api-client";
import axios from "axios";
import {
  FETCH_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  MESSAGE_TYPES,
  getAssetUrl,
} from "@/lib/constants";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { MdFolderZip } from "react-icons/md";

const MessageContainer = ({ themeColor = "#1c1d25" }) => {
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  const {
    selectedChatData,
    setSelectedChatMessages,
    selectedChatMessages,
    selectedChatType,
    userInfo,
    setDownloadProgress,
    setIsDownloading,
  } = useAppStore();

  const messageEndRef = useRef(null);

  // Fetch messages for contact or channel
  useEffect(() => {
    if (!selectedChatData?._id) return;

    const getMessages = async () => {
      const response = await apiClient.post(
        FETCH_ALL_MESSAGES_ROUTE,
        { id: selectedChatData._id },
        { withCredentials: true }
      );
      if (response.data?.messages) setSelectedChatMessages(response.data.messages);
    };

    const getChannelMessages = async () => {
      const response = await apiClient.get(
        `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
        { withCredentials: true }
      );
      if (response.data?.messages) setSelectedChatMessages(response.data.messages);
    };

    if (selectedChatType === "contact") getMessages();
    else if (selectedChatType === "channel") getChannelMessages();
  }, [selectedChatData, selectedChatType]);

  // autoscroll
  useEffect(() => {
    if (messageEndRef.current) messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedChatMessages]);

  // Helpers
  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    const response = await axios.get(getAssetUrl(url), {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setDownloadProgress(percentCompleted);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  // format dates as Today, Yesterday, or standard date
  const formatMessageDate = (timestamp) => {
    const messageMoment = moment(timestamp);
    if (messageMoment.isSame(moment(), "day")) {
      return "Today";
    } else if (messageMoment.isSame(moment().subtract(1, "day"), "day")) {
      return "Yesterday";
    }
    return messageMoment.format("LL");
  };

  // render
  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      // Group consecutive messages by sender, same day, within 2 minutes
      const prevMessage = selectedChatMessages[index - 1];
      const isSameSender =
        prevMessage &&
        (selectedChatType === "contact"
          ? prevMessage.sender === message.sender
          : prevMessage.sender?._id === message.sender?._id);
      const isWithinTime =
        prevMessage &&
        moment(message.timestamp).diff(moment(prevMessage.timestamp), "minutes") < 2;
      const isSameDay = prevMessage && moment(message.timestamp).isSame(moment(prevMessage.timestamp), "day");
      const isGrouped = isSameSender && isWithinTime && isSameDay && !showDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="flex items-center my-6 select-none">
              <div className="flex-1 border-t border-white/5" />
              <span className="mx-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {formatMessageDate(message.timestamp)}
              </span>
              <div className="flex-1 border-t border-white/5" />
            </div>
          )}
          {selectedChatType === "contact"
            ? renderPersonalMessages(message, isGrouped)
            : renderChannelMessages(message, isGrouped)}
        </div>
      );
    });
  };

  const renderPersonalMessages = (message, isGrouped) => {
    const isMe = message.sender !== selectedChatData._id;
    return (
      <div
        className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
          isGrouped ? "mt-0.5" : "mt-3"
        } w-full`}
      >
        {message.messageType === MESSAGE_TYPES.TEXT && (
          <div
            className={`${
              isMe
                ? "bg-blue-600/90 text-white rounded-tr-sm"
                : "bg-neutral-800 text-neutral-100 rounded-tl-sm"
            } inline-block px-4 py-2.5 rounded-2xl max-w-[65%] sm:max-w-[55%] break-words text-sm sm:text-base leading-relaxed shadow-sm transition-all`}
          >
            <span className="emoji">{message.content}</span>
          </div>
        )}

        {message.messageType === MESSAGE_TYPES.FILE && renderFileMessage(message)}

        {!isGrouped && (
          <div className="text-[10px] text-neutral-500 mt-1 select-none px-2">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  const renderChannelMessages = (message, isGrouped) => {
    const isMe = message.sender?._id === userInfo.id;
    return (
      <div
        className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${
          isGrouped ? "mt-0.5" : "mt-4"
        } w-full`}
      >
        {/* Render Header & Avatar only if not grouped and not me */}
        {!isGrouped && message.sender?._id !== userInfo.id && (
          <div className="flex items-center gap-2 mb-1.5 ml-1">
            <Avatar className="h-6 w-6">
              {message.sender?.image && (
                <AvatarImage
                  src={getAssetUrl(message.sender.image)}
                  alt="profile"
                  className="rounded-full object-cover"
                />
              )}
              <AvatarFallback
                className={`uppercase h-6 w-6 flex ${getColor(
                  message.sender?.color
                )} items-center justify-center rounded-full text-[10px] font-semibold`}
              >
                {message.sender?.firstName ? message.sender.firstName[0] : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-neutral-300">
              {message.sender?.firstName
                ? `${message.sender.firstName} ${message.sender.lastName ?? ""}`
                : "Unknown"}
            </span>
            <span className="text-[10px] text-neutral-500 select-none">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        )}

        {/* If isMe and not grouped, show timestamp at the top right */}
        {!isGrouped && isMe && (
          <div className="text-[10px] text-neutral-500 mb-1 mr-2 select-none">
            {moment(message.timestamp).format("LT")}
          </div>
        )}

        {/* Message Content */}
        <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}>
          {message.messageType === MESSAGE_TYPES.TEXT && (
            <div
              className={`${
                isMe
                  ? "bg-blue-600/90 text-white rounded-tr-sm"
                  : "bg-neutral-800 text-neutral-100 rounded-tl-sm"
              } inline-block px-4 py-2.5 rounded-2xl max-w-[65%] sm:max-w-[55%] break-words text-sm sm:text-base leading-relaxed shadow-sm transition-all ${
                !isMe ? "ml-8" : ""
              }`}
            >
              <span className="emoji">{message.content}</span>
            </div>
          )}

          {message.messageType === MESSAGE_TYPES.FILE && (
            <div className={!isMe ? "ml-8" : ""}>
              {renderFileMessage(message)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFileMessage = (message) => {
    const isMe = (typeof message.sender === "string" ? message.sender : message.sender?._id) === userInfo.id;
    return (
      <div
        className={`${
          isMe
            ? "bg-blue-600/90 text-white rounded-tr-sm"
            : "bg-neutral-800 text-neutral-100 rounded-tl-sm"
        } inline-block p-2.5 rounded-2xl max-w-[70%] sm:max-w-[55%] break-words shadow-sm overflow-hidden`}
      >
        {checkIfImage(message.fileUrl) ? (
          <div
            className="cursor-pointer overflow-hidden rounded-xl group relative"
            onClick={() => {
              setShowImage(true);
              setImageURL(message.fileUrl);
            }}
          >
            <img
              src={getAssetUrl(message.fileUrl)}
              alt="Uploaded attachment"
              className="max-h-[240px] sm:max-h-[320px] object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <span className="text-xs bg-black/60 px-3 py-1.5 rounded-full text-white font-medium backdrop-blur-sm">View Image</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4 p-1">
            <span className="text-neutral-200 text-3xl bg-white/10 rounded-xl p-2.5 flex items-center justify-center">
              <MdFolderZip />
            </span>
            <div className="flex flex-col min-w-0 mr-2">
              <span className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px] text-neutral-100">
                {message.fileUrl.split("/").pop()}
              </span>
              <span className="text-[10px] text-neutral-400 select-none uppercase font-bold tracking-wider">Attachment</span>
            </div>
            <button
              className="bg-white/10 p-2 text-xl rounded-xl hover:bg-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 transition-all text-neutral-200"
              onClick={() => downloadFile(message.fileUrl)}
              aria-label="Download attachment"
            >
              <IoMdArrowRoundDown />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hidden p-6 px-10 md:w-[68vw] lg:w-[73vw] xl:w-[83vw] w-full pb-24"
      style={{ backgroundColor: themeColor }}
    >
      {renderMessages()}
      <div ref={messageEndRef} />

      {/* Image preview */}
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col bg-black/70 animate-fade-in">
          <div className="relative max-w-[90vw] max-h-[80vh]">
            <img
              src={getAssetUrl(imageURL)}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              alt="Preview"
            />
          </div>
          <div className="flex gap-4 fixed bottom-8">
            <button
              className="bg-neutral-800/80 hover:bg-neutral-700/80 text-white p-4 text-2xl rounded-full cursor-pointer transition-all duration-200 border border-white/10 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => downloadFile(imageURL)}
              aria-label="Download image"
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-neutral-800/80 hover:bg-neutral-700/80 text-white p-4 text-2xl rounded-full cursor-pointer transition-all duration-200 border border-white/10 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
              aria-label="Close preview"
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
