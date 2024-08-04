const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const queryProducts = require("../../utils/queryProducts");
const Review = require("../../models/reviewModel");
const moment = require("moment");
const {
  mongo: { ObjectId },
} = require("mongoose");

exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().limit(12).sort({
      createdAt: -1,
    });

    const allProducts1 = await Product.find().limit(9).sort({
      createdAt: -1,
    });

    const latest_product = formateProduct(allProducts1);

    const allProducts2 = await Product.find().limit(9).sort({
      rating: -1,
    });

    const topRated_product = formateProduct(allProducts2);

    const allProducts3 = await Product.find().limit(9).sort({
      discount: -1,
    });

    const discount_product = formateProduct(allProducts3);

    if (!products || !allProducts1 || !allProducts2 || !allProducts3)
      res.status(404).json({ message: "Some thing went wrong." });

    res
      .status(200)
      .json({ products, latest_product, topRated_product, discount_product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const formateProduct = (products) => {
  const productArray = [];
  let i = 0;
  while (i < products.length) {
    let temp = [];
    let j = i;
    while (j < i + 3) {
      if (products[j]) {
        temp.push(products[j]);
      }
      j++;
    }
    productArray.push([...temp]);
    i = j;
  }
  return productArray;
};

exports.price_range_product = async (req, res) => {
  try {
    const priceRange = { low: 0, high: 0 };

    const products = await Product.find().limit(9).sort({
      createdAt: -1, // 1 for asc -1 for Desc
    });

    const latest_product = formateProduct(products);

    const getForPrice = await Product.find().sort({
      price: 1,
    });

    if (getForPrice.length > 0) {
      priceRange.high = getForPrice[getForPrice.length - 1].price;
      priceRange.low = getForPrice[0].price;
    }

    res.status(200).json({
      latest_product,
      priceRange,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.query_products = async (req, res) => {
  const parPage = 12;
  req.query.parPage = parPage;

  console.log(req.query);

  try {
    const products = await Product.find().sort({
      createAt: -1,
    });

    const totalProduct = new queryProducts(products, req.query)
      .categoryQuery()
      .ratingQuery()
      .priceQuery()
      .searchQuery()
      .sortPriceQuery()
      .countProducts();

    const result = new queryProducts(products, req.query)
      .categoryQuery()
      .ratingQuery()
      .priceQuery()
      .searchQuery()
      .sortPriceQuery()
      .skip()
      .limit()
      .getProducts();

    res.status(200).json({ products: result, totalProduct, parPage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductDetails = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOne({ slug });
    if (!product)
      return res.status(404).json({ message: "Something went wrong." });

    const relatedProducts = await Product.find({
      $and: [
        {
          _id: {
            $ne: product._id,
          },
        },
        {
          category: {
            $eq: product.category,
          },
        },
      ],
    }).limit(12);

    const modelProducts = await Product.find({
      $and: [
        {
          _id: {
            $ne: product._id,
          },
        },
        {
          sellerId: {
            $eq: product.sellerId,
          },
        },
      ],
    }).limit(3);

    res
      .status(200)
      .json({ product, message: "OK", relatedProducts, modelProducts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.customerReview = async (req, res) => {
  const { productId, rating, review, name } = req.body;
  try {
    const reviewC = await Review.create({
      productId,
      rating,
      review,
      name,
      date: moment(Date.now()).format("LL"),
    });

    if (!reviewC)
      return res.status(404).json({ message: "Something went wrong." });

    let rat = 0;

    const reviews = await Review.find({ productId });

    if (reviews.length)
      rat = reviews.reduce((init, r) => init + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: rat,
    });

    res.status(201).json({ message: "Send review success." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomerReview = async (req, res) => {
  const { productId } = req.params;
  let { page } = req.query;
  page = parseInt(page);
  const limit = 5;
  const skipPage = limit * (page - 1);

  try {
    let getRating = await Review.aggregate([
      {
        $match: {
          productId: {
            $eq: new ObjectId(productId),
          },
          rating: {
            $not: {
              $size: 0,
            },
          },
        },
      },
      {
        $unwind: "$rating",
      },
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let rating_review = [
      {
        rating: 5,
        sum: 0,
      },
      {
        rating: 4,
        sum: 0,
      },
      {
        rating: 3,
        sum: 0,
      },
      {
        rating: 2,
        sum: 0,
      },
      {
        rating: 1,
        sum: 0,
      },
    ];

    for (let i = 0; i < rating_review.length; i++) {
      for (let j = 0; j < getRating.length; j++) {
        if (rating_review[i].rating === getRating[j]._id) {
          rating_review[i].sum = getRating[j].count;
          break;
        }
      }
    }

    const getAllReview = await Review.find({ productId });

    const reviews = await Review.find({
      productId,
    })
      .skip(skipPage)
      .limit(limit)
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ reviews, total_review: getAllReview.length, rating_review });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
