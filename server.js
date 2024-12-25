require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const GloblaMiddleWare = require('./middleware/auth.js');

/// Middle ware things
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({
    useTempFiles: true
}));
// app.use(GloblaMiddleWare)
/// Routes
app.use('/user', require('./routes/user_router.js'));
app.use('/api', require('./routes/category_router.js'));
app.use('/api', require('./routes/upload.js'));
app.use('/api', require('./routes/products_route.js'));

/// Connect to mongodb
const URI = process.env.MONGO_DB_URL;
mongoose.connect(URI).then(() => {
    console.log("Connection successful");
}).catch((e) => {
    console.log(e);
});

const PORT = process.env.port || 3000;

app.get('/', (req, res) => {
    res.json({ msg: "Welcome to Ecommerce platform." });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
