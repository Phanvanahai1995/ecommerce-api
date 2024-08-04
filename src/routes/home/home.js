const express = require("express");
const homeController = require("../../controller/home/home");

const router = express.Router();

router.get("/category-get", homeController.getCategory);

router.get("/products-get", homeController.getProducts);

router.get("/price-range-latest-product", homeController.price_range_product);

router.get("/query_products", homeController.query_products);

router.get("/get-product-details/:slug", homeController.getProductDetails);

router.post("/customer-review", homeController.customerReview);

router.get("/get-customer-review/:productId", homeController.getCustomerReview);

module.exports = router;
