const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const Wishlist = require("../../models/wishlistModel");

const {
  mongo: { ObjectId },
} = require("mongoose");

exports.addToCart = async (req, res) => {
  const { quantity, userId, productId } = req.body;
  try {
    const cart = await Cart.findOne({
      $and: [
        {
          productId: {
            $eq: productId,
          },
        },
        {
          userId: {
            $eq: userId,
          },
        },
      ],
    });

    if (cart) {
      return res
        .status(404)
        .json({ message: "Product Already Added To Card." });
    }

    const product = await Cart.create({ userId, productId, quantity });

    res.status(201).json({ message: "Add To Cart successfully.", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCardProducts = async (req, res) => {
  const co = 5;
  const { userId } = req.params;

  try {
    const card_products = await Cart.aggregate([
      {
        $match: {
          userId: {
            $eq: new ObjectId(userId),
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "products",
        },
      },
    ]);

    if (!card_products)
      return res.status(404).json({ message: "Something went wrong." });

    let buy_product_item = 0;
    let calculatePrice = 0;
    let card_product_count = 0;
    const outOfStockProduct = card_products.filter(
      (p) => p.products[0].stock < p.quantity
    );

    // for (let i = 0; i < outOfStockProduct.length; i++) {
    //   card_product_count = card_product_count + outOfStockProduct[i].quantity;
    // }

    const stockProduct = card_products.filter(
      (p) => p.products[0].stock >= p.quantity
    );

    for (let i = 0; i < stockProduct.length; i++) {
      const { quantity } = stockProduct[i];
      card_product_count = buy_product_item + quantity;

      buy_product_item = buy_product_item + quantity;
      const { price, discount } = stockProduct[i].products[0];
      if (discount !== 0) {
        calculatePrice =
          calculatePrice + quantity * (price - (price * discount) / 100);
      } else {
        calculatePrice = calculatePrice + quantity * price;
      }
    }

    let p = [];
    let unique = [
      ...new Set(stockProduct.map((p) => p.products[0].sellerId.toString())),
    ];

    for (let i = 0; i < unique.length; i++) {
      let price = 0;
      for (let j = 0; j < stockProduct.length; j++) {
        const tempProduct = stockProduct[j].products[0];
        if (unique[i] === tempProduct.sellerId.toString()) {
          let pri = 0;
          if (tempProduct.discount !== 0) {
            pri =
              tempProduct.price -
              (tempProduct.price * tempProduct.discount) / 100;
          } else {
            pri = tempProduct.price;
          }
          pri = pri - (pri * co) / 100;
          price = price + pri * stockProduct[j].quantity;
          p[i] = {
            sellerId: unique[i],
            shopName: tempProduct.shopName,
            price,
            products: p[i]
              ? [
                  ...p[i].products,
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ]
              : [
                  {
                    _id: stockProduct[j]._id,
                    quantity: stockProduct[j].quantity,
                    productInfo: tempProduct,
                  },
                ],
          };
        }
      }
    }

    res.status(200).json({
      cart_products: p,
      price: calculatePrice,
      cart_product_count: card_product_count,
      shipping_free: 20 * p.length,
      outOfStockProduct,
      buy_product_item,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete_cart_product = async (req, res) => {
  const { id } = req.params;

  try {
    const cart_product = await Cart.findByIdAndDelete(id);

    if (!cart_product)
      return res.status(404).json({ message: "Delete cart products fail." });

    return res
      .status(200)
      .json({ message: "Delete cart products successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.incrementCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart_products = await Cart.findById(id);

    if (!cart_products)
      return res.status(404).json({ message: "Something went wrong." });

    const product = await Product.findById(cart_products.productId);

    if (cart_products.quantity < product.stock) {
      cart_products.quantity = cart_products.quantity + 1;

      await cart_products.save();

      res.status(201).json({ message: "Increment product cart successfully" });
    } else {
      res.status(404).json({ message: "Out of Stock Product." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.decrementCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart_products = await Cart.findById(id);

    if (!cart_products)
      return res.status(404).json({ message: "Something went wrong." });

    if (cart_products.quantity > 1) {
      cart_products.quantity = cart_products.quantity - 1;

      await cart_products.save();

      return res
        .status(201)
        .json({ message: "Decrement product successfully" });
    } else {
      await Cart.findByIdAndDelete(id);

      res.status(201).json({ message: "Delete cart products successfully." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  const { slug } = req.body;

  try {
    const product = await Wishlist.findOne({ slug });
    if (product) {
      return res
        .status(404)
        .message({ message: "This Product is already Wishlist." });
    }

    await Wishlist.create(req.body);

    res.status(201).json({ message: "Products add to Wishlist successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishList = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ userId });

    if (!wishlist) {
      return res.status(404).message({ message: "Some thing went wrong" });
    }

    const wishlist_count = await Wishlist.find({ userId }).countDocuments();

    res.status(200).json({
      wishlist,
      wishlist_count,
      message: "Products add to Wishlist successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeWishList = async (req, res) => {
  const { wishlistId } = req.params;

  try {
    const wishProduct = await Wishlist.findByIdAndDelete(wishlistId);

    if (!wishProduct)
      return res.status(404).message({ message: "Some thing went wrong" });

    res.status(200).json({ message: "Delete wishlist product successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
