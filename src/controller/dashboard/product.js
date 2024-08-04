const Product = require("../../models/productModel");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUND_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.AKI_SECRET,
  secure: true,
});

exports.addProduct = async (req, res) => {
  const { id } = req;

  console.log(id);

  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    const { images } = files;
    let {
      name,
      description,
      price,
      stock,
      discount,
      brand,
      shopName,
      category,
    } = field;

    const slug = name.trim().split(" ").join("-");

    try {
      let allImageUrl = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].filepath, {
          folder: "products",
        });

        if (!result) res.status(404).json({ message: "Some thing went wrong" });

        allImageUrl.push(result.url);
      }

      const product = await Product.create({
        sellerId: id,
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        brand: brand.trim(),
        shopName,
        slug,
        discount: parseInt(discount),
        stock: parseInt(stock),
        price: parseInt(price),
        images: allImageUrl,
      });

      if (!product)
        return res.status(404).json({ message: "Something went wrong." });

      return res
        .status(201)
        .json({ product, message: "Create product successfully." });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  });
};

exports.getProducts = async (req, res) => {
  const { page, searchValue, parPage } = req.query;
  const { id } = req;
  skipPage = parseInt(parPage) * (parseInt(page) - 1);

  try {
    if (searchValue) {
      const products = await Product.find({
        $text: { $search: searchValue },
        sellerId: id,
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalProducts = await Product.find({
        $text: { $search: searchValue },
        sellerId: id,
      }).countDocuments();

      res.status(200).json({ products, totalProducts });
    } else {
      const products = await Product.find({ sellerId: id })
        .skip(skipPage)
        .limit(parPage)
        .sort({
          createdAt: -1,
        });

      const totalProducts = await Product.find({
        sellerId: id,
      }).countDocuments();

      res.status(200).json({ products, totalProducts });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json("Something went wrong.");

    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.editProduct = async (req, res) => {
  let { productId, name, description, price, stock, discount, brand } =
    req.body;
  name = name.trim();
  const slug = name.split(" ").join("-");

  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        stock,
        discount,
        brand,
        slug,
      },
      { returnDocument: "after" }
    );

    if (!product) return res.status(404).json("Something went wrong.");

    return res.status(200).json({ product, message: "Update successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProductImage = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    const { productId, oldImage } = field;
    const { newImage } = files;

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const result = await cloudinary.uploader.upload(newImage.filepath, {
        folder: "products",
      });

      if (!result)
        return res.status(404).json({ message: "Something went wrong." });

      const product = await Product.findById(productId);

      product.images = product.images.map((image) => {
        if (image === oldImage) return result.url;

        return image;
      });

      await product.save();

      res.status(200).json({ product, message: "Change Images Successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};
