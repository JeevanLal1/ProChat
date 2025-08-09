import { Server as SocketIOServer } from "socket.io";
import Message from "./model/MessagesModel.js";
import Channel from "./model/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Map userId -> Set(socketId)
  const userSockets = new Map();
  const socketToUser = new Map();

  const getUserSocketIds = (userId) => {
    const s = userSockets.get(userId);
    return s ? Array.from(s) : [];
  };

  const broadcastOnlineUsers = () => {
    io.emit("onlineUsersList", Array.from(userSockets.keys()));
  };

  const addChannelNotify = async (channel) => {
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const mId = member.toString();
        getUserSocketIds(mId).forEach((sid) =>
          io.to(sid).emit("new-channel-added", channel)
        );
      });
    }
  };

  const sendMessage = async (message) => {
    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color")
      .exec();

    const recipientId = message.recipient;
    const senderId = message.sender;

    getUserSocketIds(recipientId).forEach((sid) =>
      io.to(sid).emit("receiveMessage", messageData)
    );
    getUserSocketIds(senderId).forEach((sid) =>
      io.to(sid).emit("receiveMessage", messageData)
    );
  };

  /**
   * Channel message: write to DB then broadcast to the channel room.
   * We emit the misspelled event "recieve-channel-message" because your client
   * currently listens to that event. This keeps the client unchanged.
   *
   * We also ensure the sending socket is joined to the room if we receive its socketId.
   */
  const sendChannelMessage = async (message, senderSocketId = null) => {
    try {
      const { channelId, sender, content, messageType, fileUrl } = message;

      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      });

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();

      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });

      // final payload to send to clients
      const finalData = { ...messageData._doc, channelId };

      // make sure the sending socket is in the room 
      if (senderSocketId) {
        const senderSocket = io.sockets.sockets.get?.(senderSocketId) ?? io.sockets.sockets[senderSocketId];
        try {
          if (senderSocket && typeof senderSocket.join === "function") {
            senderSocket.join(channelId);
          }
        } catch (err) {
        }
      }

      // Broadcast to everyone in the channel room.
      io.to(channelId).emit("recieve-channel-message", finalData);
      io.to(channelId).emit("receive-channel-message", finalData);
    } catch (err) {
      console.error("sendChannelMessage error:", err);
    }
  };

  const addUserSocket = (userId, socketId) => {
    let set = userSockets.get(userId);
    if (!set) {
      set = new Set();
      userSockets.set(userId, set);
    }
    set.add(socketId);
    socketToUser.set(socketId, userId);
    if (set.size === 1) io.emit("userOnline", { userId });
    broadcastOnlineUsers();
  };

  const removeUserSocket = (socketId) => {
    const userId = socketToUser.get(socketId);
    if (!userId) return null;
    const set = userSockets.get(userId);
    if (!set) return null;
    set.delete(socketId);
    socketToUser.delete(socketId);
    if (set.size === 0) {
      userSockets.delete(userId);
      io.emit("userOffline", { userId });
    }
    broadcastOnlineUsers();
    return null;
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      addUserSocket(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("add-channel-notify", addChannelNotify);
    socket.on("sendMessage", sendMessage);

    // Pass socket.id so sender's socket can be joined to the room if needed.
    socket.on("send-channel-message", (message) =>
      sendChannelMessage(message, socket.id)
    );

    socket.on("joinRoom", ({ chatId }) => {
      if (!chatId) return;
      socket.join(chatId);
    });

    socket.on("userTyping", (payload = {}) => {
      try {
        const typingUserId =
          payload.typingUserId ?? payload.userId ?? payload.user?._id;
        const firstName = payload.firstName ?? "";
        const isChannel = !!(payload.isChannel ?? payload.channel ?? false);
        const channelId = payload.chatId ?? payload.channelId;
        const recipientId =
          payload.recipientId ??
          payload.recipient ??
          (isChannel ? undefined : payload.chatId);

        if (isChannel) {
          if (!channelId) return;
          socket
            .to(channelId)
            .emit("userTyping", { userId: typingUserId, firstName, chatId: channelId });
        } else {
          if (!recipientId) return;
          getUserSocketIds(recipientId).forEach((sid) =>
            io.to(sid).emit("userTyping", {
              userId: typingUserId,
              firstName,
              chatId: typingUserId,
            })
          );
        }
      } catch (err) {
        console.error("userTyping handler error:", err);
      }
    });

    socket.on("userStopTyping", (payload = {}) => {
      try {
        const typingUserId =
          payload.typingUserId ?? payload.userId ?? payload.user?._id;
        const isChannel = !!(payload.isChannel ?? payload.channel ?? false);
        const channelId = payload.chatId ?? payload.channelId;
        const recipientId =
          payload.recipientId ??
          payload.recipient ??
          (isChannel ? undefined : payload.chatId);

        if (isChannel) {
          if (!channelId) return;
          socket
            .to(channelId)
            .emit("userStopTyping", { userId: typingUserId, chatId: channelId });
        } else {
          if (!recipientId) return;
          getUserSocketIds(recipientId).forEach((sid) =>
            io.to(sid).emit("userStopTyping", {
              userId: typingUserId,
              chatId: typingUserId,
            })
          );
        }
      } catch (err) {
        console.error("userStopTyping handler error:", err);
      }
    });

    socket.on("disconnect", () => {
      removeUserSocket(socket.id);
      console.log("Client disconnected", socket.id);
    });
  });
};

export default setupSocket;
