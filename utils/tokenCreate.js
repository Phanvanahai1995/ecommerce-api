require("dotenv").config();

const jwt = require("jsonwebtoken");

exports.createToken = async (data) => {
  const token = await jwt.sign(data, process.env.TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return token;
};
