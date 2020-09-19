const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Seller = require("../models/seller");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const seller = new Seller({
      email: req.body.email,
      password: hash
    });
    seller
      .save()
      .then(result => {
        res.status(201).json({
          message: "Seller created!",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fetchedSeller;
  Seller.findOne({ email: req.body.email })
    .then(seller => {
      if (!seller) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      fetchedSeller = seller;
      return bcrypt.compare(req.body.password, seller.password);
    })
    .then(result => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const token = jwt.sign(
        { email: fetchedSeller.email, sellerId: fetchedSeller._id },
        "secret_this_should_be_longer",
        { expiresIn: 3600 }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        sellerId: fetchedSeller._id 
      });
    })
    .catch(err => {
      return res.status(401).json({
        message: "Auth failed"
      });
    });
});

module.exports = router;
