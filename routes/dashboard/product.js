const express = require("express");
const productController = require("../../controller/dashboard/product");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/product-add", authMiddleware, productController.addProduct);

router.get("/products-get", authMiddleware, productController.getProducts);

router.get(
  "/product-get/:productId",
  authMiddleware,
  productController.getProduct
);

router.patch("/product-edit", authMiddleware, productController.editProduct);

router.patch(
  "/product_image_update",
  authMiddleware,
  productController.updateProductImage
);

module.exports = router;
