const Users = require("../model/user_model.js");
const socketIo = require("socket.io");
const Message = require("../model/chat_model.js");

const chatCtrl = {
  userSearch: async (req, res) => {
    try {
      const { name } = req.body; // Get the search term from the request body
      if (!name || name.trim() === "") {
        return res.status(400).json({ msg: "Name query is required." });
      }

      // Search for users with names containing the input (case-insensitive)
      const users = await Users.find(
        {
          name: { $regex: name, $options: "i" },
        }, // Case-insensitive regex search
        {
          name: 1,
          _id: 0, // Projection: include 'name', exclude '_id'
        }
      );

      // Handle cases where no users are found
      if (users.length === 0) {
        return res.status(404).json({ msg: "No users found." });
      }

      // Return the list of matching users
      res.json({ users: users });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "An error occurred." });
    }
  },

  getMessage: async (req, res) => {
    const { sender, receiver } = req.body;
    if (!sender || !receiver) {
      return res
        .status(400)
        .json({ msg: "Both sender and receiver are required" });
    }
    try {
      const messages = await Message.find(
        {
          $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender },
          ],
        },
        {
          message: 1,
          _id: 0, // Projection: include 'name', exclude '_id'
        }
      ).sort({ timestamp: 1 }); // Sort by timestamp to get the correct order

      res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ msg: "Failed to retrieve messages" });
    }
  },
};
// WebSocket connection handling
const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Allow requests from all origins (configure this for security in production)
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Listen for a "send_message" event
    socket.on("send_message", async (data) => {
      const { receiver, sender, message } = data;

      // Save the message to the database
      try {
        const newMessage = new Message({
          sender: sender,
          receiver: receiver,
          message: message,
        });

        await newMessage.save(); // Save the message to MongoDB

        // Broadcast the message to the receiver's socket (private message)
        io.to(receiver).emit("receive_message", { sender, receiver, message });
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { msg: "Failed to save message" });
      }
    });

    // Handle client disconnect
    socket.on("disconnect", () => {
    });
  });
};

module.exports = { chatCtrl, initSocket };
