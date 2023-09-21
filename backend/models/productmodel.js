const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product Description"],
    minLength: [5, "Atlest 5 characters for description"],
  },
  price: [
    {
      type: Number,
      required: [true, "Please enter product price"],
      maxLength: [8, "Price cannot exceeds 8 char"],
    },
  ],
  MRP: {
    type: Number,
    required: [true, "Please enter product MRP"],
    maxLength: [8, "MRP cannot exceeds 8 char"],
  },
  priority: {
    type: Number,
    maxLength: [2, "priority cannot exceeds 8 char"],
    default: 99,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: [true, "Please enter pubid for img"],
      },
      url: {
        type: String,
        required: [true, "Please enter url for img"],
      },
    },
  ],
  keywords: [
    {
      type: String,
      required: [true, "Please Enter Keywords in Array"],
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter category"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxLength: [4, "stock cannot exceeds 4 chars"],
    default: 1,
  },
  numofReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ExpiresOn: {
    type: String,
    required: [true, "please enter expiry date"],
  },
  companyName: {
    type: String,
    maxLength: [10, "cannot exceeds 10 char for company name"],
    required: [true, "please enter company name"],
  },
  Quantity: {
    type: String,
    required: [true, "Please enter quantity for your product"],
  },
});

module.exports = mongoose.model("Product", productSchema);
