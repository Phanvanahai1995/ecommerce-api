const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    review: {
      type: String,
      require: true,
    },
    rating: {
      type: Number,
      require: true,
    },
    productId: {
      type: Schema.ObjectId,
      require: true,
    },
    date: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reviews", reviewSchema);
