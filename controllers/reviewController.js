const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;

  const newReview = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    user: req.body.user,
    tour: req.body.tour,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) return next(new AppError('Review Does not exists', 404));

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) return next(new AppError('Review Does not exists', 404));

  if (req.user.role === 'user' && req.user._id != review.user.id)
    return next(new AppError('You cannot update this review', 403));

  const upatedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      rating: req.body.rating,
      review: req.body.review,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: upatedReview,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) return next(new AppError('Review Does not exists', 404));

  if (req.user.role === 'user' && req.user._id !== review.user)
    return next(new AppError('You cannot delete this review', 403));

  await Review.findByIdAndDelete(reviewId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = { user: req.user._id };
  if (req.params.tourId) filter.tour = req.params.tourId;

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
