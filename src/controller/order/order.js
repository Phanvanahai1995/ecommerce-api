const moment = require("moment");
const AuthOrder = require("../../models/authOrder");
const CustomerOrder = require("../../models/customerOrder");
const Cart = require("../../models/cartModel");

const paymentCheck = async (id) => {
  try {
    const order = await CustomerOrder.findById(id);

    if (order.payment_status === "unpaid") {
      await CustomerOrder.findByIdAndUpdate(id, {
        delivery_status: "cancelled",
      });

      await AuthOrder.updateMany(
        {
          orderId: id,
        },
        {
          delivery_status: "cancelled",
        }
      );
    }

    return true;
  } catch (err) {
    console.log(err);
  }
};

exports.placeOrder = async (req, res) => {
  const { price, products, shipping_free, shippingInfo, userId } = req.body;
  let authorOrderData = [];
  let cardId = [];
  const tempDate = moment(Date.now()).format("LLL");

  let customerOrderProduct = [];

  for (let i = 0; i < products.length; i++) {
    const pro = products[i].products;
    for (let j = 0; j < pro.length; j++) {
      const tempCusPro = pro[j].productInfo;
      tempCusPro.quantity = pro[j].quantity;
      customerOrderProduct.push(tempCusPro);
      if (pro[j]._id) {
        cardId.push(pro[j]._id);
      }
    }
  }

  try {
    const order = await CustomerOrder.create({
      customerId: userId,
      shippingInfo,
      products: customerOrderProduct,
      price: price + shipping_free,
      payment_status: "unpaid",
      delivery_status: "pending",
      date: tempDate,
    });
    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      const pri = products[i].price;
      const sellerId = products[i].sellerId;
      let storePor = [];
      for (let j = 0; j < pro.length; j++) {
        const tempPro = pro[j].productInfo;
        tempPro.quantity = pro[j].quantity;
        storePor.push(tempPro);
      }

      authorOrderData.push({
        orderId: order.id,
        sellerId,
        products: storePor,
        price: pri,
        payment_status: "unpaid",
        shippingInfo: "Easy Main Warehouse",
        delivery_status: "pending",
        date: tempDate,
      });
    }

    await AuthOrder.insertMany(authorOrderData);
    for (let k = 0; k < cardId.length; k++) {
      await Cart.findByIdAndDelete(cardId[k]);
    }

    setTimeout(() => {
      paymentCheck(order.id);
    }, 15000);

    res
      .status(200)
      .json({ message: "Order Place Success.", orderId: order._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardData = async (req, res) => {
  const { userId } = req.params;
  try {
    const recentOrders = await CustomerOrder.find({ customerId: userId }).limit(
      5
    );

    const pendingOrder = await CustomerOrder.find({
      customerId: userId,
      delivery_status: "pending",
    }).countDocuments();

    const totalOrder = await CustomerOrder.find({
      customerId: userId,
    }).countDocuments();

    const cancelledOrder = await CustomerOrder.find({
      customerId: userId,
      delivery_status: "cancelled",
    }).countDocuments();

    res
      .status(200)
      .json({ recentOrders, pendingOrder, totalOrder, cancelledOrder });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  const { customerId, status } = req.params;

  try {
    let order;
    if (status !== "all") {
      order = await CustomerOrder.find({
        customerId,
        delivery_status: status,
      });
    } else {
      order = await CustomerOrder.find({
        customerId,
      });
    }

    if (!order)
      return res.status(404).json({ message: "Something went wrong" });

    res.status(200).json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await CustomerOrder.findById(orderId);

    if (!order)
      return res.status(404).json({ message: "Something went wrong" });

    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
