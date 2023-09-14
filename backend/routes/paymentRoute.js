const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/isAuth");
const {
  processPayment,
  sendStripeApiKey,
} = require("./controller/paymentControllers");

router.route("/payment/process").post(isAuthenticatedUser, processPayment);
router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

module.exports = router;
