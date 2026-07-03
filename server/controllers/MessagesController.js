import Message from "../model/MessagesModel.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";

export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;
    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required.");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (request, response, next) => {
  try {
    if (request.file) {
      // Upload file buffer to Cloudinary folder 'prochat_attachments'
      const uploadResult = await uploadToCloudinary(
        request.file.buffer,
        "prochat_attachments",
        "auto"
      );
      
      // Return the secure Cloudinary URL inside the filePath response parameter
      return response.status(200).json({ filePath: uploadResult.secure_url });
    } else {
      return response.status(404).send("File is required.");
    }
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return response.status(500).send("Internal Server Error.");
  }
};
