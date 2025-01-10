const Post = require("../model/create_post_model.js");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const postCtrl = {
  createPost: async (req, res) => {
    try {
      const data = req.decodeToken;

      if (!req.files || Object.keys(req.files).length === 0)
        return res.status(400).json({ msg: "No files were uploaded" });

      const file = req.files;
      if (file.size > 1024 * 1024) {
        return res.status(400).json({ msg: "File size is exceed" });
      }

      const { username, postTitle } = req.body;
      const { image } = req.files;

      if (!image || !username || !postTitle) {
        return res.status(400).json({ msg: "Some fields are missing" });
      }
      const uploadResponse = await cloudinary.v2.uploader.upload(
        image.tempFilePath,
        {
          folder: "PostImage",
          use_filename: true, // Use the original filename if possible
          unique_filename: true, // Generate a unique filename
          resource_type: "auto", // Automatically detect the resource type (e.g., image, video)
        }
      );
      const post = {
        username,
        postTitle,
        image: uploadResponse.secure_url, // URL of the uploaded image
      };
      const newuser = new Post({
        user_id: data.id,
        username,
        postTitle,
        image: uploadResponse.secure_url,
      });
      await newuser.save();
      removeTmp(image.tempFilePath);
      res.status(201).json({ msg: "Post created successfully", post });
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Something wrong", error: error.message });
    }
  },

  getPost: async (req, res) => {
    try {
      const post = await Post.find().populate({
        path: "user_id",
        select: "name email",
      }); // for multiple
      //   const post = await Post.find().populate('user_id').select('name'); // for single

      res.json(post);
    } catch (error) {
      return res
        .status(500)
        .json({ msg: "Something wrong", error: error.message });
    }
  },
};

const removeTmp = async (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = postCtrl;
