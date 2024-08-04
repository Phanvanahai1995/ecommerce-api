const express = require("express");
const orderController = require("../../controller/order/order");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/order/place-order", orderController.placeOrder);

router.get(
  "/customer/get-dashboard-data/:userId",
  orderController.getDashboardData
);

router.get(
  "/customer/get_orders/:customerId/:status",
  orderController.getOrders
);

router.get(
  "/customer/get_orders_details/:orderId",
  orderController.getOrderDetails
);

module.exports = router;
