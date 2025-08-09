// src/contexts/SocketContext.jsx
import { SOCKET_HOST } from "@/lib/constants";
import { useAppStore } from "@/store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (!userInfo) return;

    const s = io(SOCKET_HOST, {
      withCredentials: true,
      query: { userId: userInfo.id, name: userInfo.firstName || userInfo.email },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to socket server", s.id);
    });

    // message handlers (unchanged)
    const handleReceiveMessage = (message) => {
      const {
        selectedChatData: currentChatData,
        selectedChatType: currentChatType,
        addMessage,
        addContactInDMContacts,
      } = useAppStore.getState();

      if (
        currentChatType !== undefined &&
        (currentChatData._id === message.sender._id ||
          currentChatData._id === message.recipient?._id)
      ) {
        addMessage(message);
      }
      addContactInDMContacts(message);
    };

    const handleReceiveChannelMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        addChannelInChannelLists,
      } = useAppStore.getState();

      if (
        selectedChatType !== undefined &&
        selectedChatData._id === message.channelId
      ) {
        addMessage(message);
      }
      addChannelInChannelLists(message);
    };

    const addNewChannel = (channel) => {
      const { addChannel } = useAppStore.getState();
      addChannel(channel);
    };

    s.on("receiveMessage", handleReceiveMessage);
    s.on("recieve-channel-message", handleReceiveChannelMessage);
    s.on("new-channel-added", addNewChannel);

    // ---- PRESENCE HANDLERS ----
    const { setOnlineUsers, addOnlineUser, removeOnlineUser } = useAppStore.getState();

    s.on("onlineUsersList", (users) => {
      // users: array of userIds (strings)
      console.log("onlineUsersList received:", users);
      setOnlineUsers(users);
    });

    s.on("userOnline", ({ userId }) => {
      console.log("userOnline:", userId);
      addOnlineUser(userId);
    });

    s.on("userOffline", ({ userId }) => {
      console.log("userOffline:", userId);
      removeOnlineUser(userId);
    });

    // cleanup
    return () => {
      s.off("receiveMessage", handleReceiveMessage);
      s.off("recieve-channel-message", handleReceiveChannelMessage);
      s.off("new-channel-added", addNewChannel);

      s.off("onlineUsersList");
      s.off("userOnline");
      s.off("userOffline");

      s.disconnect();
      setSocket(null);
    };
  }, [userInfo]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
