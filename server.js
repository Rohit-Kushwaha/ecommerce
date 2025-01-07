require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const Message = require("./model/chat_model.js");
// const { initSocket } = require("./controllers/chat_ctrl.js");
const { Server } = require("socket.io");

/// Middle ware things
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

/// Routes
app.use("/user", require("./routes/user_router.js"));
app.use("/api", require("./routes/category_router.js"));
app.use("/api", require("./routes/upload.js"));
app.use("/api", require("./routes/places_route.js"));
app.use("/api", require("./routes/items_router.js"));
app.use("/api", require("./routes/otp_route.js"));
app.use("/api", require("./routes/chat_router.js"));

/// Connect to mongodb
const URI = process.env.MONGO_DB_URL;
mongoose
  .connect(URI)
  .then(() => {
    console.log("Connection successful");
  })
  .catch((e) => {
    console.log(e);
  });

const PORT = process.env.port || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
// const io = initSocket(server);
// WebSocket connection handling
// const io = (server) => {
// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Allow requests from all origins (configure this for security in production)
//     methods: ["GET", "POST"],
//   },
// });
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from all origins
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // Listen for a "send_message" event
  socket.on("send_message", async (data) => {
    const { receiverId, senderId, message } = data;
    console.log(receiverId);
    console.log(senderId);
    console.log(message);
    // Save the message to the database
    try {
      const newMessage = new Message({
        senderId: senderId,
        receiverId: receiverId,
        message: message,
      });
      console.log(newMessage);

      if (receiverId) {
        io.except(senderId).emit("receive_message", { message });
    
        console.log(`Message sent to receiver ${receiverId}`);
      } else {
        console.log(`Receiver ${receiverId} is not connected.`);
      }

        // socket.emit("receive_message", { message });

      await newMessage.save(); // Save the message to MongoDB

      // Broadcast the message to the receiver's socket (private message)
      // io.to(receiverId).emit("receive_message", { senderId, receiverId, message });
      // Send data to the server

    //   console.log("receive_message");
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { msg: "Failed to save message" });
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {});
});
//   };

app.get("/", (req, res) => {
  res.json({ msg: "Welcome to Connect Sphere." });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
