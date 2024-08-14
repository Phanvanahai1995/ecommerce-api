const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sellerCustomerSchema = new Schema(
  {
    myId: {
      type: String,
      require: true,
    },
    myFriends: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("seller_customers", sellerCustomerSchema);
