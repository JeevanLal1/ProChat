// import React from "react";

import { useEffect } from "react";
import ChatContainer from "./components/chat-container";
import ContactsContainer from "./components/contacts-container";
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import EmptyChatContainer from "./components/empty-chat-container";

const Chat = () => {
  const {
    userInfo,
    selectedChatType,
    isUploading,
    fileUploadProgress,
    isDownloading,
    downloadProgress,
  } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo.profileSetup) {
      toast("Please setup profile to continue.");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex h-[100vh] text-white overflow-hidden">
      {isUploading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-[100] left-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center flex-col gap-4 select-none animate-fade-in">
          <h5 className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">Uploading Attachment</h5>
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${fileUploadProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-blue-400">{fileUploadProgress}%</span>
        </div>
      )}
      {isDownloading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-[100] left-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center flex-col gap-4 select-none animate-fade-in">
          <h5 className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">Downloading Attachment</h5>
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-blue-400">{downloadProgress}%</span>
        </div>
      )}

      
      <ContactsContainer />
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>
  );
};

export default Chat;
