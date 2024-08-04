const Customer = require("../../models/customerModel");
const SellerCustomer = require("../../models/chat/sellerCustomerModal");
const bcrypt = require("bcrypt");
const { createToken } = require("../../utils/tokenCreate");

exports.customer_register = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const existingUser = await Customer.findOne({ email });

    if (existingUser)
      return res.status(404).json({ message: "Email already exits." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      email: email.trim(),
      name: name.trim(),
      password: hashedPassword,
      method: "menualy",
    });

    await SellerCustomer.create({
      myId: customer._id,
    });

    const token = await createToken({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      method: customer.method,
    });

    res.cookie("customerToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ token, message: "Create User Successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.customer_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (!customer)
      return res.status(404).json({ message: "Incorrect email or password." });

    const isPassword = await bcrypt.compare(password, customer.password);

    if (!isPassword)
      return res.status(404).json({ message: "Incorrect email or password." });

    const token = await createToken({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      method: customer.method,
    });

    res.cookie("customerToken", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({ token, message: "Login Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
