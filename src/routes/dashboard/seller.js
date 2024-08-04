const express = require("express");
const sellerController = require("../../controller/dashboard/seller");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/get-seller-request",
  authMiddleware,
  sellerController.getSellerRequest
);

router.get(
  "/get_seller_detail/:sellerId",
  authMiddleware,
  sellerController.getSeller
);

router.patch(
  "/update_seller_status/:sellerId",
  authMiddleware,
  sellerController.updateSellerStatus
);

module.exports = router;
