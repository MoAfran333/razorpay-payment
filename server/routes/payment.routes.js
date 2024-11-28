const express = require("express");

const {
  checkoutPayment,
  verifyPayment,
} = require("../controllers/payment.controllers");

const router = express.Router();

router.post("/checkout", checkoutPayment);
router.post("/verify", verifyPayment);

module.exports = router;
