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
          _id: 1, // Projection: include 'name', exclude '_id'
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
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ msg: "Both sender and receiver are required" });
    }
    try {
      const messages = await Message
        .find(
        // .sort({ timestamp: -1 })
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        }
        // {
        //   message: 1,
        //   senderId: senderId,
        //   receiverId: receiverId,
        //   _id: 0, // Projection: include 'name', exclude '_id'
        // }
        
      ); // Sort by timestamp to get the correct order

      // Transform messages to correctly reflect sender/receiver roles
      // Determine direction of each message
      const formattedMessages = messages.map((msg) => {
        if (msg.senderId === senderId && msg.receiverId === receiverId) {
          return {
            message: msg.message,
            senderId: senderId,
            receiverId: receiverId,
          };
        } else if (msg.senderId === receiverId && msg.receiverId === senderId) {
          return {
            message: msg.message,
            senderId: receiverId,
            receiverId: senderId,
          };
        } else {
          // This should not happen, but handle it just in case
          // return {
          //   message: msg.message,
          //   direction: "unknown",
          // };
        }
      });
      res.json({ messages: formattedMessages });
      // res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ msg: "Failed to retrieve messages" });
    }
  },

  getChattedUser: async (req, res) => {
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ msg: "Sender id required" });
    }
    // Fetch unique user IDs from messages where the sender or receiver is the logged-in user
    const messageColl = await Message.aggregate([
      // Aggregation Pipeline:
      // $match: Filters messages involving the logged-in user as a sender or receiver.
      // $project: Dynamically determines the user ID of the other participant in the chat.
      // $group: Groups by the determined user ID to ensure uniqueness.
      {
        $match: {
          $or: [{ senderId }, { receiverId: senderId }],
        },
      },
      // Certainly! The $project stage in the aggregation pipeline is used to shape
      //  the structure of the documents that are passed to the next stage. In this case,
      //  the $cond operator is used to dynamically decide which field
      // (senderId or receiverId) should be included as userId. Let me break it down:
      {
        $project: {
          userId: {
            // { $cond: [ <condition>, <true-case>, <false-case> ] }
            $cond: [
              { $eq: ["$senderId", senderId] },
              "$receiverId",
              "$senderId",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
    ]);
    // console.log(messageColl);

    // Extract user IDs
    const userIds = messageColl.map((doc) => doc._id);

    // Fetch user details for the unique user IDs
    const users = await Users.find({ _id: { $in: userIds } }, { name: 1 });

    res.json({ username: users });
  },

  saveChattedUser: async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;

      if (!receiverId) {
        return res.json({ msg: "Receiver Id can not be null" });
      }

      const messagee = "";

      const newChattedUser = new Message({
        senderId: senderId,
        receiverId: receiverId,
        message: messagee,
      });
      await newChattedUser.save();
      res.json({ msg: "User added" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: error.message });
    }
  },
};

// module.exports = { chatCtrl, initSocket };
module.exports = { chatCtrl };
