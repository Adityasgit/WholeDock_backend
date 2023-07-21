const mongoose = require("mongoose");

const connectToMongoDB = () => {
  console.log("connecting.....");
  mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB connected succesfully"));
};

module.exports = connectToMongoDB;
