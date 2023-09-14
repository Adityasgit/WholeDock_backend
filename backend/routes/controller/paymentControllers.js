const catchAsyncErrors = require("../../middleware/catchAsyncError");

const stripe = require("stripe")(
  "sk_test_51NnNOvSFuTHP5moll42UMi912KEH9uUgd1xuslK6BmROQaLuLVA5SD6wQF6Pf34ihfkbHTsknflM9U5LfURbBpuf00K82fEJFw"
);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "E-commerce",
    },
  });
  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
