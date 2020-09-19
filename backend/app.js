const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const carsRoutes = require("./routes/cars");
const sellerRoutes = require("./routes/seller")

const app = express();

mongoose
  .connect('mongodb+srv://peaksen:aJbJr5NkMadedqTY@cluster0.nlthm.mongodb.net/servicebot?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

// setting up body parser to handle incoming data 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("images")));

// handle CORS 
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/cars", carsRoutes);
app.use("/api/seller", sellerRoutes);


module.exports = app;