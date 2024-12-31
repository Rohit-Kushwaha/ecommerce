const router = require("express").Router();

const cloudinary = require("cloudinary");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/auth_admin");
const fs = require("fs");

// we will upload image on cloudinary
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image only admin can use

router.post("/upload", auth, authAdmin, async (req, res) => {
  try {
    console.log(req.files);
    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).json({ msg: "No files were uploaded" });
    const file = req.files.file;
    if (file.size > 1024 * 1024) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: "File size is exceed" });
    }
    if (
      // file.mimetype !== 'application/pdf'
      // && file.mimetype !== 'image/jpeg' &&
      file.mimetype !== "image/jpeg"
    ) {
      removeTmp(file.tempFilePath);
      return res.status(400).json({ msg: "File format is not supported" });
    }

    await cloudinary.v2.uploader.upload(
      file.tempFilePath,
      { folder: "test" },
      async (err, result) => {
        if (err) throw err;
        removeTmp(file.tempFilePath);

        res.json({ public_Id: result.public_id, secureUrl: result.secure_url });
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Something wrong", error: error.message });
  }
});

// delete image only admin can use
router.post("/destroy", auth, authAdmin, (req, res) => {
  try {
    const { public_id } = req.body;
    console.log(public_id);
    if (!public_id) {
      return res.status(400).json({ msg: "No image selected" });
    }
    cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
      if (err) {
        throw err;
      }
      res.json({ msg: "Image deleted" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Something wrong", error: error.message });
  }
});

const removeTmp = async (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};

module.exports = router;
