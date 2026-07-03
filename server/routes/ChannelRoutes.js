import { Router } from "express";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
  deleteChannel,
} from "../controllers/ChannelControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);
channelRoutes.delete("/delete-channel/:channelId", verifyToken, deleteChannel);

export default channelRoutes;
