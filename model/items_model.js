const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true, // Removes whitespace from the beginning and end
    },
    itemPrice: {
        type: Number,
        required: true,
        min: 0, // Ensures the price is non-negative
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

// mongoose middleware
itemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Items", itemSchema);
