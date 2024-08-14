const SellerCustomer = require("../../models/chat/sellerCustomerModal");
const SellerCustomerMsg = require("../../models/chat/sellerCustomerMessage");
const Seller = require("../../models/sellerModel");
const Customer = require("../../models/customerModel");

exports.addCustomerFriend = async (req, res) => {
  const { sellerId, userId } = req.body;

  try {
    if (sellerId !== "") {
      const seller = await Seller.findById(sellerId);
      const user = await Customer.findById(userId);

      const checkSeller = await SellerCustomer.findOne({
        $and: [
          {
            myId: {
              $eq: userId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                fdId: sellerId,
              },
            },
          },
        ],
      });

      if (!checkSeller) {
        await SellerCustomer.updateOne(
          {
            myId: userId,
          },
          {
            $push: {
              myFriends: {
                fdId: sellerId,
                name: seller.shopInfo?.shopName,
                image: seller.image,
              },
            },
          }
        );
      }

      const checkCustomer = await SellerCustomer.findOne({
        $and: [
          {
            myId: {
              $eq: sellerId,
            },
          },
          {
            myFriends: {
              $elemMatch: {
                fdId: userId,
              },
            },
          },
        ],
      });

      if (!checkCustomer) {
        await SellerCustomer.updateOne(
          {
            myId: sellerId,
          },
          {
            $push: {
              myFriends: {
                fdId: userId,
                name: user.name,
                image: "",
              },
            },
          }
        );
      }

      const messages = await SellerCustomerMsg.find({
        $or: [
          {
            $and: [
              {
                receiverId: {
                  $eq: sellerId,
                },
              },
              {
                senderId: {
                  $eq: userId,
                },
              },
            ],
          },
          {
            $and: [
              {
                receiverId: {
                  $eq: userId,
                },
              },
              {
                senderId: {
                  $eq: sellerId,
                },
              },
            ],
          },
        ],
      });

      const MyFriends = await SellerCustomer.findOne({
        myId: userId,
      });

      const currentFd = MyFriends.myFriends.find((s) => s.fdId === sellerId);

      res
        .status(200)
        .json({ MyFriends: MyFriends.myFriends, currentFd, messages });
    } else {
      const messages = await SellerCustomerMsg.find({
        $or: [
          {
            $and: [
              {
                receiverId: {
                  $eq: sellerId,
                },
              },
              {
                senderId: {
                  $eq: userId,
                },
              },
            ],
          },
          {
            $and: [
              {
                receiverId: {
                  $eq: userId,
                },
              },
              {
                senderId: {
                  $eq: sellerId,
                },
              },
            ],
          },
        ],
      });

      const MyFriends = await SellerCustomer.findOne({
        myId: userId,
      });

      res.status(200).json({ MyFriends: MyFriends.myFriends, messages });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessageToSeller = async (req, res) => {
  const { userId, sellerId, text, name } = req.body;

  try {
    const message = await SellerCustomerMsg.create({
      senderId: userId,
      senderName: name,
      receiverId: sellerId,
      message: text,
    });

    const data = await SellerCustomer.findOne({
      myId: userId,
    });

    let myFriends = data.myFriends;
    let index = myFriends.findIndex((f) => f.fdId === sellerId);

    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;

      index--;
    }

    await SellerCustomer.updateOne(
      {
        myId: userId,
      },
      {
        myFriends,
      }
    );

    const data1 = await SellerCustomer.findOne({
      myId: sellerId,
    });

    let myFriends1 = data1.myFriends;
    let index1 = myFriends.findIndex((f) => f.fdId === userId);

    while (index1 > 0) {
      let temp = myFriends1[index1];
      myFriends1[index1] = myFriends[index1 - 1];
      myFriends1[index1 - 1] = temp;

      index1--;
    }

    await SellerCustomer.updateOne(
      {
        myId: sellerId,
      },
      {
        myFriends1,
      }
    );

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomers = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const data = await SellerCustomer.findOne({
      myId: sellerId,
    });

    res.status(200).json({
      customers: data.myFriends,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomerMessage = async (req, res) => {
  const { customerId } = req.params;
  const { id } = req;

  try {
    const messages = await SellerCustomerMsg.find({
      $or: [
        {
          $and: [
            {
              receiverId: {
                $eq: id,
              },
            },
            {
              senderId: {
                $eq: customerId,
              },
            },
          ],
        },
        {
          $and: [
            {
              receiverId: {
                $eq: customerId,
              },
            },
            {
              senderId: {
                $eq: id,
              },
            },
          ],
        },
      ],
    });

    const currentCustomer = await Customer.findById(customerId);

    res.status(200).json({
      messages,
      currentCustomer,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessageToCustomer = async (req, res) => {
  const { senderId, receiverId, text, name } = req.body;

  try {
    const message = await SellerCustomerMsg.create({
      senderId: senderId,
      senderName: name,
      receiverId: receiverId,
      message: text,
    });

    const data = await SellerCustomer.findOne({
      myId: senderId,
    });

    let myFriends = data.myFriends;
    let index = myFriends.findIndex((f) => f.fdId === receiverId);

    while (index > 0) {
      let temp = myFriends[index];
      myFriends[index] = myFriends[index - 1];
      myFriends[index - 1] = temp;

      index--;
    }

    await SellerCustomer.updateOne(
      {
        myId: senderId,
      },
      {
        myFriends,
      }
    );

    const data1 = await SellerCustomer.findOne({
      myId: receiverId,
    });

    let myFriends1 = data1.myFriends;
    let index1 = myFriends.findIndex((f) => f.fdId === senderId);

    while (index1 > 0) {
      let temp = myFriends1[index1];
      myFriends1[index1] = myFriends[index1 - 1];
      myFriends1[index1 - 1] = temp;

      index1--;
    }

    await SellerCustomer.updateOne(
      {
        myId: receiverId,
      },
      {
        myFriends1,
      }
    );

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
