const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "admin",
  },
});

module.exports = mongoose.model("admins", adminSchema);
