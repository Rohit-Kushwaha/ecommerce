const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    item_id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], trim: true },
    url: { type: String, required: true, trim: true },
    features: { type: [String], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);

// mongoose middleware
// itemSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });