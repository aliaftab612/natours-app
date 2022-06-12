const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('../models/bookingModel');
const { query } = require('express');
const User = require('../models/userModel');

exports.getToursOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com https://*.cloudflare.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('overview', {
      title: 'All Tours',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  let tour;
  try {
    tour = await Tour.findOne({ _id: req.params.tourId }).populate({
      path: 'reviews',
      fiels: 'review rating user',
    });
  } catch (err) {
    return next(new AppError('Tour with this tour ID does not exist.', 404));
  }

  if (!tour) {
    return next(new AppError('Tour with this tour ID does not exist.', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://*.stripe.com https://*.cloudflare.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});

exports.getLogin = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com ttps://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('login', {
      title: 'Login',
    });
});

exports.getSignUp = catchAsync(async (req, res, next) => {
  if (req.query.email) {
    const user = await User.findOne({ email: req.query.email });

    if (!user) {
      return next(new AppError(`Invalid Email Address!`, 400));
    }

    if (user.signedUp) {
      return next(new AppError('Already Signed Up. Please Login!', 400));
    }

    return res
      .status(200)
      .set(
        'Content-Security-Policy',
        "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com ttps://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
      .render('signup', {
        title: 'Sign Up',
        email: req.query.email,
      });
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com ttps://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('signup', {
      title: 'Sign Up',
    });
});

exports.getAccount = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('account', {
      title: 'Your Account',
    });
};

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('overview', {
      title: 'My Bookings',
      tours,
    });
});

exports.alerts = (req, res, next) => {
  if (req.query.alert && req.query.alert === 'booking')
    res.locals.alert =
      "Your Booking was successful! Please check your email for confirmation. If your booking doesn't show up immediately, please come back later.";

  next();
};

exports.getForgotPassword = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('forgotPassword', {
      title: 'Forgot Password',
    });
};

exports.getResetPassword = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.cloudflare.com https://*.stripe.com http://localhost:3000 ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://*.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('resetPassword', {
      title: 'Reset Password',
    });
};
