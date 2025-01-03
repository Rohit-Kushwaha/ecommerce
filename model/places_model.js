const mongoose = require("mongoose");

// Define the description schema
const descriptionSchema = new mongoose.Schema({
  summary: { type: String, required: true, trim: true },
  price: { type: Number, required: true, trim: true },
  history: { type: String, trim: true },
  bestTimeToVisit: { type: String, required: true, trim: true },
  tips: { type: String, trim: true },
  facilities: { type: [String] },
});

const placeSchema = new mongoose.Schema(
  {
    place_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, trim: true },
    rating: { type: Number, required: true, trim: true },
    description: { type: [descriptionSchema], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);
