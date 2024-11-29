const express = require("express");

const {
  checkoutPayment,
  verifyPayment,
  webhook,
  refund,
  exittedmodal,
} = require("../controllers/payment.controllers");

const router = express.Router();

router.post("/checkout", checkoutPayment);
router.post("/verify", verifyPayment);
// router.post("/failed-payment", failedPayment);
router.post("/webhook", express.json(), webhook);
router.post("/refund", refund);
router.post("/exitted-modal/:order_id", exittedmodal);

module.exports = router;
