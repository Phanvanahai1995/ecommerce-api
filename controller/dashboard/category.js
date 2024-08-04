const Category = require("../../models/categoryModel");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

exports.addCategory = async (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(404).json({ message: "Some thing went wrong." });

    let { name } = fields;
    const { image } = files;
    name = name.trim();
    const slug = name.split(" ").join("-");

    cloudinary.config({
      cloud_name: process.env.CLOUND_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.AKI_SECRET,
      secure: true,
    });

    try {
      const result = await cloudinary.uploader.upload(image.filepath, {
        folder: "categories",
      });

      if (result) {
        const category = await Category.create({
          name,
          image: result.url,
          slug,
        });

        res
          .status(201)
          .json({ category, message: "Category Added Successfully" });
      } else {
        return res.status(404).json({ message: "Some thing went wrong." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  });
};

exports.getCategory = async (req, res) => {
  const { page, searchValue, parPage } = req.query;

  try {
    let skipPage = "";

    if (parPage && page) {
      skipPage = parseInt(parPage) * (parseInt(page) - 1);
    }

    if (searchValue && page && parPage) {
      const categories = await Category.find({
        $text: { $search: searchValue },
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalCategory = await Category.find({
        $text: { $search: searchValue },
      }).countDocuments();

      res.status(200).json({ categories, totalCategory });
    } else if (searchValue === "" && page && parPage) {
      const categories = await Category.find()
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalCategory = await Category.find().countDocuments();

      res.status(200).json({ categories, totalCategory });
    } else {
      const categories = await Category.find().sort({ createdAt: -1 });

      const totalCategory = await Category.find().countDocuments();

      res.status(200).json({ categories, totalCategory });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
