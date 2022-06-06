const crypto = require('crypto');
const mongoose = require('mongoose');
const argon2 = require('argon2');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is Required'],
  },
  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique: true,
    validate: [validator.isEmail, 'Please enter proper email address'],
  },
  password: {
    type: String,
    required: [true, 'Passsword is required'],
    minlength: [8, 'Password should be atleast of 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'guide', 'lead-guide', 'user'],
      message: 'Please enter correct values for roles!',
    },
    default: 'user',
  },
  image: String,
  confirmPassword: {
    type: String,
    required: [true, 'Confirm Passsword is required'],
    minlength: [8, 'Confirm Password should be atleast of 8 characters'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password and confirm password does not match',
    },
  },
  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  signedUp: {
    type: Boolean,
    default: false,
  },
  emailVerificationCode: Number,
});

userSchema.pre('save', async function (next) {
  if (this.password) {
    this.password = await argon2.hash(this.password);
    this.confirmPassword = undefined;
  }

  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  inputPassword,
  userPasswordHash
) {
  return argon2.verify(userPasswordHash, inputPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changedTimeStamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
