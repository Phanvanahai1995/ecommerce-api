const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    slug: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({
  name: "text",
});

module.exports = mongoose.model("categories", categorySchema);
