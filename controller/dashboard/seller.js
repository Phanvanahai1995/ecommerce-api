const Seller = require("../../models/sellerModel");

exports.getSellerRequest = async (req, res) => {
  const { page, searchValue, parPage } = req.query;

  const skipPage = parseInt(parPage) * (parseInt(page) - 1);
  try {
    if (searchValue) {
      //   const sellers = await Seller.find(
      //     { status: "pending" },
      //     { $search: searchValue }
      //   )
      //     .skip(page)
      //     .limit(parPage);
    } else {
      const sellers = await Seller.find({ status: "pending" })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createAt: -1 });

      const totalSellers = await Seller.find({
        status: "pending",
      }).countDocuments();

      return res
        .status(200)
        .json({ sellers, totalSellers, message: "Get Seller successfully" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSeller = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(404).json({ message: "Something went wrong." });

    res.status(200).json(seller);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateSellerStatus = async (req, res) => {
  const { sellerId } = req.params;
  const { status } = req.body;

  try {
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      {
        status,
      },
      {
        returnDocument: "after",
      }
    );

    if (!seller)
      return res.status(404).json({ message: "Something went wrong." });

    res.status(200).json({ seller, message: "Update Status successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
