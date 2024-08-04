const express = require("express");
const customerController = require("../../controller/home/customer");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/customer-register", customerController.customer_register);

router.post("/customer-login", customerController.customer_login);

module.exports = router;
