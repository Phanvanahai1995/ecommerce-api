const express = require("express");
const cartController = require("../../controller/home/cart");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/products/add-cart", cartController.addToCart);

router.get(
  "/products/get_cart_product/:userId",
  cartController.getCardProducts
);

router.delete(
  "/products/delete_cart_product/:id",
  cartController.delete_cart_product
);

router.patch(
  "/products/increment_cart_product/:id",
  cartController.incrementCart
);

router.patch(
  "/products/decrement_cart_product/:id",
  cartController.decrementCart
);

router.post("/products/add-to-wishlist", cartController.addToWishlist);

router.get("/products/get-wishlist/:userId", cartController.getWishList);

router.delete(
  "/products/remove-wishlist/:wishlistId",
  cartController.removeWishList
);

module.exports = router;
