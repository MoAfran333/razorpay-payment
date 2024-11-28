const razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/payment.models");
require("dotenv").config();

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const checkoutPayment = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  const order = await instance.orders.create(options);
  console.log("order : ", order);

  if (!order) {
    return res
      .status(400)
      .json({ success: false, error: "Error creating the Order" });
  }

  res.status(200).json({ success: true, order });
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isEqual = expectedSignature === razorpay_signature;

    if (!isEqual) {
      res
        .status(400)
        .json({ success: false, error: "Error in validating the payment" });
    }

    const originalString =
      process.env.RAZORPAY_KEY_ID + ":" + process.env.RAZORPAY_KEY_SECRET;

    let bufferObj = Buffer.from(originalString, "utf8");

    let base64String = bufferObj.toString("base64");

    console.log("The encoded base64 string is:", base64String);

    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${base64String}`,
        },
      }
    );
    const data = await response.json();

    const newPayment = await Payment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_status: data.status,
    });

    await newPayment.save();
    res.redirect(
      `http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`
    );
    //   res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.log(`Error occures, ${error.message}`);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { checkoutPayment, verifyPayment };
