const mongoose = require("mongoose");

const carSchema = mongoose.Schema({
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  imagePath: { type: String, required: true },
  // Adding a ref to Seller 
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true }
});

module.exports = mongoose.model("Car", carSchema);
