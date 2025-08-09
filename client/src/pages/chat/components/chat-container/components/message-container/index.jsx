// MessageContainer.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/api-client";
import {
  FETCH_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES,
  HOST,
  MESSAGE_TYPES,
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
    const response = await apiClient.get(`${HOST}/${url}`, {
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

  // render
  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-3">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact"
            ? renderPersonalMessages(message)
            : renderChannelMessages(message)}
        </div>
      );
    });
  };

  const renderPersonalMessages = (message) => (
    <div
      className={`message ${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === MESSAGE_TYPES.TEXT && (
        <div
          className={`${
            message.sender !== selectedChatData._id ? "bg-blue-800/60" : "bg-slate-700"
          } text-white inline-block p-3 rounded-2xl my-1 max-w-[55%] break-words text-lg leading-relaxed`}
        >
          <span className="emoji text-xl">{message.content}</span>
        </div>
      )}

      {message.messageType === MESSAGE_TYPES.FILE && renderFileMessage(message)}

      <div className="text-xs text-gray-300 mt-1">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => (
    <div
      className={`mt-5 ${
        message.sender._id !== userInfo.id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === MESSAGE_TYPES.TEXT && (
        <div
          className={`${
            message.sender._id === userInfo.id ? "bg-blue-800/60" : "bg-slate-700"
          } text-white inline-block p-3 rounded-2xl my-1 max-w-[55%] break-words ml-9 text-lg leading-relaxed`}
        >
          <span className="emoji">{message.content}</span>
        </div>
      )}

      {message.messageType === MESSAGE_TYPES.FILE && renderFileMessage(message)}

      {message.sender._id !== userInfo.id ? (
        <div className="flex items-center justify-start gap-3">
          <Avatar className="h-8 w-8">
            {message.sender.image && (
              <AvatarImage
                src={`${HOST}/${message.sender.image}`}
                alt="profile"
                className="rounded-full"
              />
            )}
            <AvatarFallback
              className={`uppercase h-8 w-8 flex ${getColor(
                message.sender.color
              )} items-center justify-center rounded-full`}
            >
              {message.sender.firstName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-white">
            {`${message.sender.firstName} ${message.sender.lastName}`}
          </span>
          <div className="text-xs text-white/60">
            {moment(message.timestamp).format("LT")}
          </div>
        </div>
      ) : (
        <div className="text-xs text-white/60 mt-1">
          {moment(message.timestamp).format("LT")}
        </div>
      )}
    </div>
  );

  const renderFileMessage = (message) => (
    <div
      className={`${
        message.sender?._id === userInfo.id ? "bg-slate-700" : "bg-blue-800/60"
      } text-white inline-block p-3 rounded-2xl my-1 lg:max-w-[55%] break-words`}
    >
      {checkIfImage(message.fileUrl) ? (
        <div
          className="cursor-pointer"
          onClick={() => {
            setShowImage(true);
            setImageURL(message.fileUrl);
          }}
        >
          <img
            src={`${HOST}/${message.fileUrl}`}
            alt=""
            className="rounded-xl"
            height={320}
            width={320}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-5">
          <span className="text-white text-4xl bg-blue-900/30 rounded-full p-3">
            <MdFolderZip />
          </span>
          <span>{message.fileUrl.split("/").pop()}</span>
          <span
            className="bg-blue-900/30 p-3 text-3xl rounded-full hover:bg-blue-900/50 cursor-pointer transition-all duration-300"
            onClick={() => downloadFile(message.fileUrl)}
          >
            <IoMdArrowRoundDown />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="flex-1 overflow-y-auto scrollbar-hidden p-6 px-10 md:w-[68vw] lg:w-[73vw] xl:w-[83vw] w-full"
      style={{ backgroundColor: themeColor }}
    >
      {renderMessages()}
      <div ref={messageEndRef} />

      {/* Image preview */}
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`${HOST}/${imageURL}`}
              className="h-[80vh] w-full bg-cover rounded-2xl"
              alt=""
            />
          </div>
          <div className="flex gap-5 fixed top-0 mt-5">
            <button
              className="bg-blue-900/30 p-4 text-3xl rounded-full hover:bg-blue-900/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-blue-900/30 p-4 text-3xl rounded-full hover:bg-blue-900/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
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
