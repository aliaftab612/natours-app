const mongoose = require('mongoose');
const Tour = require('./../models/tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review is Required'],
    minlength: 10,
    maxlength: 100,
  },
  rating: {
    type: Number,
    default: 3,
    min: [1, 'rating Average Cannot be less than 1'],
    max: [5, 'rating Average Cannot be greater than 5'],
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'User ID must be provided to which this review belongs'],
  },
  tour: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Tour',
    required: [true, 'Tour ID must be provided to which this review belongs'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

reviewSchema.statics.calcAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        ratingsAvg: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats.length > 0 ? stats[0].ratingsAvg : 4.5,
    ratingsQuantity: stats.length > 0 ? stats[0].nRatings : 0,
  });
};

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });

reviewSchema.pre(/^findOneAndUpdate/, async function (next) {
  this.r = await this.find();
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name image',
  });
  next();
});

reviewSchema.post(/^findOneAndUpdate/, async function () {
  await this.r.constructor.calcAvgRating(this.r.tour);
});

reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
