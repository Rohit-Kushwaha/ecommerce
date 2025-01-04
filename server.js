require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require("http");
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const { initSocket } = require("./controllers/chat_ctrl.js");

/// Middle ware things
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({
    useTempFiles: true
}));

/// Routes
app.use('/user', require('./routes/user_router.js'));
app.use('/api', require('./routes/category_router.js'));
app.use('/api', require('./routes/upload.js'));
app.use('/api', require('./routes/places_route.js'));
app.use('/api', require('./routes/items_router.js'));
app.use('/api', require('./routes/otp_route.js'));
app.use('/api', require('./routes/chat_router.js'));

/// Connect to mongodb
const URI = process.env.MONGO_DB_URL;
mongoose.connect(URI).then(() => {
    console.log("Connection successful");
}).catch((e) => {
    console.log(e);
});

const PORT = process.env.port || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

app.get('/', (req, res) => {
    res.json({ msg: "Welcome to Connect Sphere." });
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
