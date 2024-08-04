const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sellerCustomerMsSchema = new Schema(
  {
    senderName: {
      type: String,
      require: true,
    },
    senderId: {
      type: String,
      require: true,
    },
    receiverId: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("seller_customers_msg", sellerCustomerMsSchema);
