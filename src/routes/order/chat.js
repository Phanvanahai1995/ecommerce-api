const express = require("express");
const chatController = require("../../controller/chat/chat");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/chat/customer/add-customer-friend",
  chatController.addCustomerFriend
);

router.post(
  "/chat/customer/send-message-to-seller",
  chatController.sendMessageToSeller
);

router.get("/chat/seller/get-customers/:sellerId", chatController.getCustomers);

router.get(
  "/chat/seller/get-customer-message/:customerId",
  authMiddleware,
  chatController.getCustomerMessage
);

router.post(
  "/chat/seller/send-message-to-customer",
  authMiddleware,
  chatController.sendMessageToCustomer
);

module.exports = router;
