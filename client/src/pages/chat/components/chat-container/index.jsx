import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store";
import { useSocket } from "@/contexts/SocketContext";

const ChatContainer = () => {
  const { userInfo, selectedChatData, typingUsers: storeTypingUsers = {} } = useAppStore();
  const socket = useSocket();
  const [socketTypingUsers, setSocketTypingUsers] = useState([]); 

  const [themeColor, setThemeColor] = useState(() => {
    try {
      return localStorage.getItem("chatTheme") || "#1c1d25";
    } catch (e) {
      return "#1c1d25";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("chatTheme", themeColor);
    } catch (e) {
      console.error("Failed to save theme color to localStorage", e);
    }
  }, [themeColor]);

  useEffect(() => {
    setSocketTypingUsers([]);

    if (!socket || !selectedChatData?._id) return;

    const handleTyping = (payload = {}) => {
      const userId = payload.userId ?? payload.user?._id ?? payload.senderId;
      const firstName =
        payload.firstName ?? payload.userFirstName ?? payload.first_name ?? payload.name;
      const chatId = payload.chatId ?? payload.channelId ?? payload.roomId;

      if (!chatId || chatId !== selectedChatData._id) return;
      if (!userId) return;
      if (userId === userInfo?.id) return;

      setSocketTypingUsers((prev) => {
        if (prev.find((u) => u.userId === userId)) return prev;
        return [...prev, { userId, firstName: firstName ?? "Someone" }];
      });
    };

    const handleStopTyping = (payload = {}) => {
      const userId = payload.userId ?? payload.user?._id ?? payload.senderId;
      const chatId = payload.chatId ?? payload.channelId ?? payload.roomId;

      if (!chatId || chatId !== selectedChatData._id) return;
      if (!userId) return;

      setSocketTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("userTyping", handleTyping);
    socket.on("showTyping", handleTyping);
    socket.on("userStopTyping", handleStopTyping);
    socket.on("hideTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("showTyping", handleTyping);
      socket.off("userStopTyping", handleStopTyping);
      socket.off("hideTyping", handleStopTyping);
      setSocketTypingUsers([]);
    };
  }, [socket, selectedChatData?._id, userInfo?.id]);

  // Merge socket-reported typing users with store typing
  const mergedTypingUsers = useMemo(() => {
    const socketIds = socketTypingUsers.map((u) => u.userId);
    const storeIds = (storeTypingUsers[selectedChatData?._id] || []).filter(
      (id) => !socketIds.includes(id)
    );

    const storeMapped = storeIds.map((id) => ({
      userId: id,
      firstName: id === userInfo?.id ? userInfo?.firstName ?? "You" : "Someone",
    }));

    return [...socketTypingUsers, ...storeMapped];
  }, [socketTypingUsers, storeTypingUsers, selectedChatData?._id, userInfo?.id, userInfo?.firstName]);

  return (
    <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <ChatHeader
        typingUsers={mergedTypingUsers}
        themeColor={themeColor}
        onThemeChange={setThemeColor}
      />
      <MessageContainer themeColor={themeColor} />
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
