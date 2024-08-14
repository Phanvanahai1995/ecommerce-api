const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ message: "Please Login First" });
  } else {
    try {
      const deCodeToken = await jwt.verify(
        accessToken,
        process.env.TOKEN_SECRET
      );

      req.role = deCodeToken.role;
      req.id = deCodeToken.id;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Please Login" });
    }
  }
};
