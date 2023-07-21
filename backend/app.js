const express = require("express");
const app = express();
const errormiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
// Routes import
const ProductRoute = require("./routes/ProductRoute");
const UserRoute = require("./routes/UserRoute");
const OrderRoute = require("./routes/OrderRoute");
app.use(express.json());
app.use(cookieParser());
// api for product
app.use("/api/v1", ProductRoute);
// api for auth
app.use("/api/v1", UserRoute);
// api for order
app.use("/api/v1", OrderRoute);

// error handeled
app.use(errormiddleware);

module.exports = app;
