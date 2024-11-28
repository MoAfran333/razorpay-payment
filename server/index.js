const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const paymentRoutes = require("./routes/payment.routes");
const connectDB = require("./DB/connectDB");

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/payments", paymentRoutes);

app.get("/api/get-key", (req, res) => {
  return res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  connectDB();
  console.log(`Server started on port ${port}`);
});
