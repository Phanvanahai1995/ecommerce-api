const mongoose = require("mongoose");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUND_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.AKI_SECRET,
  secure: true,
});

const Admin = require("../models/adminModel");
const Seller = require("../models/sellerModel");
const SellerCustomer = require("../models/chat/sellerCustomerModal");

const bcrypt = require("bcrypt");
const { createToken } = require("../utils/tokenCreate");

exports.admin_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email: email });

    if (!admin)
      return res
        .status(404)
        .json({ message: "Email or password are not accepted" });

    const isPassword = await bcrypt.compare(password, admin.password);

    if (!isPassword)
      return res
        .status(404)
        .json({ message: "Email or password are not accepted" });

    const token = await createToken({
      id: admin._id,
      role: admin.role,
    });

    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ token, message: "Login Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.seller_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const seller = await Seller.findOne({ email: email });

    if (!seller)
      return res
        .status(404)
        .json({ message: "Email or password are not accepted" });

    const isPassword = await bcrypt.compare(password, seller.password);

    if (!isPassword)
      return res
        .status(404)
        .json({ message: "Email or password are not accepted" });

    const token = await createToken({
      id: seller._id,
      role: seller.role,
    });

    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ token, message: "Login Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.seller_register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const getUser = await Seller.findOne({ email: email });

    if (getUser)
      return res.status(404).json({ message: "Account doesn't exist" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
      method: "menualy",
      shopInfo: {},
    });

    await SellerCustomer.create({
      myId: seller._id,
    });

    const token = await createToken({
      id: seller._id,
      role: seller.role,
    });

    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ token, message: "Register Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  const { id, role } = req;

  try {
    if (role === "admin") {
      const user = await Admin.findById(id);

      res.status(200).json({ userInfo: user });
    } else {
      const seller = await Seller.findById(id);

      res.status(200).json({ userInfo: seller });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.profileImageUpload = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    const { image } = files;

    if (err) {
      return res.status(400).json({ message: err.message });
    }
    try {
      const result = await cloudinary.uploader.upload(image.filepath, {
        folder: "profile",
      });

      if (!result)
        return res.status(404).json({ message: "Something went wrong." });

      const seller = await Seller.findByIdAndUpdate(
        id,
        {
          image: result.url,
        },
        {
          returnDocument: "after",
        }
      );

      res.status(200).json({ seller, message: "Update Image successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

exports.profileUpdateInfo = async (req, res) => {
  const data = req.body;
  const { id } = req;
  console.log(data);

  try {
    const seller = await Seller.findByIdAndUpdate(
      id,
      {
        shopInfo: data,
      },
      { returnDocument: "after" }
    );

    if (!seller)
      return res.status(404).json({ message: "Something went wrong." });

    res.status(200).json({ seller, message: "Update Info Shop successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
