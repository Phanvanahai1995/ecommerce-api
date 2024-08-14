const express = require("express");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./middleware/cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/dashboard/category");
const productRoutes = require("./routes/dashboard/product");
const sellerRoutes = require("./routes/dashboard/seller");
const homeRoutes = require("./routes/home/home");
const customerRoutes = require("./routes/home/customer");
const cartRoutes = require("./routes/home/cart");
const orderRoutes = require("./routes/order/order");
const chatRoutes = require("./routes/order/chat");
// const http = require("http");
// const socket = require("socket.io");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "*",
  })
);
// app.use(cors());

// const server = http.createServer(app);

const port = process.env.PORT_URL;

// const io = socket(server, {
//   cors: {
//     origin: "*",
//     credentials: true,
//   },
// });

// let allCustomer = [];
// let allSeller = [];

// const addUser = (customerId, socketId, userInfo) => {
//   const checkUser = allCustomer.some((u) => u.customerId === customerId);

//   if (!checkUser) {
//     allCustomer.push({
//       customerId,
//       socketId,
//       userInfo,
//     });
//   }
// };

// const addSeller = (sellerId, socketId, userInfo) => {
//   const checkSeller = allSeller.some((u) => u.sellerId === sellerId);

//   if (!checkSeller) {
//     allSeller.push({
//       sellerId,
//       socketId,
//       userInfo,
//     });
//   }
// };

// const findCustomer = (customerId) => {
//   return allCustomer.find((c) => c.customerId === customerId);
// };

// const findSeller = (sellerId) => {
//   return allSeller.find((s) => s.sellerId === sellerId);
// };

// const remove = (socketId) => {
//   allCustomer = allCustomer.filter((c) => c.socketId !== socketId);
//   allSeller = allSeller.filter((s) => s.socketId !== socketId);
// };

// io.on("connection", (soc) => {
//   console.log("Socket server running");

//   soc.on("add_user", (customerId, userInfo) => {
//     addUser(customerId, soc.id, userInfo);
//     io.emit("activeSeller", allSeller);
//   });

//   soc.on("add_seller", (sellerId, userInfo) => {
//     addSeller(sellerId, soc.id, userInfo);
//     io.emit("activeSeller", allSeller);
//   });

//   soc.on("send_seller_message", (msg) => {
//     const customer = findCustomer(msg.receiverId);
//     if (customer !== undefined) {
//       soc.to(customer.socketId).emit("seller_message", msg);
//     }
//   });

//   soc.on("send_customer_message", (msg) => {
//     const seller = findSeller(msg.receiverId);
//     if (seller !== undefined) {
//       soc.to(seller.socketId).emit("customer_message", msg);
//     }
//   });

//   soc.on("disconnect", () => {
//     console.log("user disconnect");
//     remove(soc.id);
//     io.emit("activeSeller", allSeller);
//   });
// });

app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", sellerRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/home", cartRoutes);
app.use("/api/home", orderRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api", chatRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Hello Server.</h1>");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected from MongoDB");
    // server.listen(process.env.PORT, () => {
    //   console.log(`Hello Server`);
    // });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
