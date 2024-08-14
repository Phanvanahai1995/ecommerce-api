const express = require("express");
const categoryController = require("../../controller/dashboard/category");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/category-add", authMiddleware, categoryController.addCategory);

router.get("/category-get", authMiddleware, categoryController.getCategory);

module.exports = router;
