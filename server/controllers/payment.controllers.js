const razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/payment.models");
require("dotenv").config();

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const checkoutPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    // TODO: create a new payment database row here with the status as pending and the order id - DONE

    const order = await instance.orders.create(options);
    console.log("order : ", order);

    if (!order) {
      return res
        .status(400)
        .json({ success: false, error: "Error creating the Order" });
    }

    const newPayment = await Payment({
      razorpay_order_id: order.id,
      payment_status: "pending",
    });

    await newPayment.save();

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console, log(`Error : ${error.message}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
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
      return res
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

    // TODO-DONE: Remove the creation of the database row here and make it an update function.
    // TODO-DONE: Add the payment_id, signature and payment status to the required row

    const requiredPayment = await Payment.findOne({ razorpay_order_id });

    if (!requiredPayment) {
      return res
        .status(404)
        .json({ success: false, error: "could not find the order id" });
    }

    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        $set: {
          razorpay_payment_id,
          razorpay_signature,
          payment_status: data.status,
        },
      }
    );

    return res.redirect(
      `http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`
    );
    //   res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    console.log(`Error occures, ${error.message}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const exittedmodal = async (req, res) => {
  // TODO: update the payment status when modal is closed

  const { order_id: razorpay_order_id } = req.params;

  try {
    const requiredOrder = await Payment.findOne({ razorpay_order_id });

    if (!requiredOrder) {
      return res.status(404).json({ success: false, message: "Missing Order" });
    }

    if (requiredOrder.failed_reason === null) {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        {
          $set: {
            payment_status: "failed",
            failure_reason: "User closed the modal before paying",
          },
        }
      );
    }

    return res
      .status(200)
      .json({ success: true, message: "Payment Cancelled" });
  } catch (err) {
    console.log(`Error, ${err.message}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// const failedPayment = async (req, res) => {
//   try {
//     console.log(req);
//     console.log(`This payment has failed`);
//   } catch (err) {
//     console.log(`Error, ${err.message}`);
//     return res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// };

const webhook = async (req, res) => {
  const { event } = req.body;
  const payload = req.body.payload.payment.entity;

  try {
    console.log(event);
    console.log(payload);

    await Payment.findOneAndUpdate(
      { razorpay_order_id: payload.order_id },
      {
        $set: {
          razorpay_payment_id: payload.id,
          payment_status: event,
          failure_reason: payload.error_description,
        },
      }
    );

    return res.status(200).json({ success: true, message: "Payment Failed" });
  } catch (error) {
    console.log(`Error, ${err.message}`);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const refund = async (req, res) => {
  // TODO: Add a refund function to manually refund the amount and update the db accordingly
};

module.exports = {
  checkoutPayment,
  verifyPayment,
  webhook,
  refund,
  exittedmodal,
};
