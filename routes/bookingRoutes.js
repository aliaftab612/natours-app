const reviewController = require('./../controllers/reviewController');
const express = require('express');
const authController = require('./../controllers/authController.js');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.post(
  '/checkoutSession/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
