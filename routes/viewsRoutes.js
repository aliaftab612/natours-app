const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getToursOverview);

router.get('/tour/:tourId', authController.isLoggedIn, viewsController.getTour);

router.get('/login', authController.isLoggedIn, viewsController.getLogin);

router.get('/signup', authController.isLoggedIn, viewsController.getSignUp);

router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-tours', authController.protect, viewsController.getMyBookings);

router.get(
  '/forgotPassword',
  authController.isLoggedIn,
  viewsController.getForgotPassword
);

router.get(
  '/resetPassword/:resetToken',
  authController.isLoggedIn,
  viewsController.getResetPassword
);

module.exports = router;
