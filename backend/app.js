const express = require("express");
const app = express();
const errormiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const fileUpload = require("express-fileupload");
// Routes import
const ProductRoute = require("./routes/ProductRoute");
const UserRoute = require("./routes/UserRoute");
const OrderRoute = require("./routes/OrderRoute");
const PaymentRoute = require("./routes/paymentRoute");
app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    type: ["application/x-www-form-urlencoded", "application/json"], // Support json encoded bodies
  })
);
// Config
dotenv.config({ path: "backend/config/config.env" });
// api for product
app.use("/api/v1", ProductRoute);
// api for auth
app.use("/api/v1", UserRoute);
// api for order
app.use("/api/v1", OrderRoute);
app.use("/api/v1", PaymentRoute);
// error handeled
app.use(errormiddleware);

module.exports = app;
