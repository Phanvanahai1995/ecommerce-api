const express = require("express");
const authController = require("../controller/auth");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/admin-login", authController.admin_login);

router.post("/seller-register", authController.seller_register);

router.post("/seller-login", authController.seller_login);

router.get("/get-user", authMiddleware, authController.getUser);

router.patch(
  "/profile_image_upload",
  authMiddleware,
  authController.profileImageUpload
);

router.patch(
  "/profile_update_info",
  authMiddleware,
  authController.profileUpdateInfo
);

router.post("/customer-register", authController.seller_register);

module.exports = router;
