const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    quantity: {
      type: Number,
      require: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("carts", cartSchema);
