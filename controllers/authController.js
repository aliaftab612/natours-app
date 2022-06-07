const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
    emailVerificationCode: verificationCode,
  });

  await new Email(newUser, String(verificationCode)).sendVerificationEmail();

  res.status(200).json({
    status: 'success',
    message: 'Verification e-mail sent successfully!',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return next(new AppError('Please Enter Email and Password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user.signedUp) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    await User.findByIdAndUpdate(user.id, {
      emailVerificationCode: verificationCode,
    });

    await new Email(user, String(verificationCode)).sendVerificationEmail();

    return next(new AppError('SignUp process not completed', 400));
  }

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  const token = generateToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Number(new Date()) + 3153600000000),
  });

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Token not defined please Log In!', 401));
  }

  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken.id);

  if (!user)
    return next(new AppError('User Does not exist for this Token', 401));

  if (user.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User Password Recently Changed Please re-login!', 401),
      401
    );
  }

  req.user = user;
  res.locals.user = user;

  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decodedToken.id);

      if (!user) return next();

      if (user.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }

      res.locals.user = user;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Do not have permissions to perform this Action!', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('Please provide email', 400));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('User with this email address Not Found!', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.hostname}:3000/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetUrl).sendResetPasswordEmail();

    res.status(200).json({
      status: 'success',
      message: 'Reset Password Email Sent!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email Cannot be Sent!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Reset Token Invalid or Expired!', 400));

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  const token = generateToken(user._id);

  const message = `Hello ${user.name}, Your password was reset recently , if it was not you please reset immediately
          using this link - ${req.protocol}://${req.hostname}:3000/api/v1/users/forgotPassword Please use your address while resetting - ${user.email}`;

  try {
    await sendEmail({
      email: user.email,
      subject: '[Natours] Your password was reset',
      message,
    });
  } catch (err) {
    console.log('Password Change email was not sent Error!');
  }

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (!req.body.password)
    return next(new AppError('Password is Required', 400));

  if (!(await user.checkPassword(req.body.password, user.password)))
    return next(new AppError('Incorrect Current Password!', 401));

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = generateToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Number(new Date()) + 3153600000000),
  });

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password Successfully changed',
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logedOut', {
    expiresIn: new Date(Date.now),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.verifyEmailVerificationCode = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const verificationCode = req.body.emailVerificationCode;

  const user = await User.findOne({ email: email });

  if (user.signedUp) {
    return next(new AppError('Already Signed Up. Please Login!', 400));
  }

  if (user.emailVerificationCode != verificationCode) {
    return next(new AppError('Wrong verification code!', 401));
  }

  await User.findByIdAndUpdate(user.id, { signedUp: true });

  const token = generateToken(user._id);

  await new Email(
    user,
    `${req.protocol}://${req.get('host')}/me`
  ).sendWelcomeEmail();

  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Number(new Date()) + 3153600000000),
  });

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.resendEmailVerificationCode = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return next(new AppError('Please provide email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError(`Invalid Email Address!${req.query.email}`, 400));
  }

  if (user.signedUp) {
    return next(new AppError('Already Signed Up. Please Login!', 400));
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  await User.findByIdAndUpdate(user.id, {
    emailVerificationCode: verificationCode,
  });

  await new Email(user, String(verificationCode)).sendVerificationEmail();

  res.status(200).json({
    status: 'success',
    message: 'Email Verification Code sent successfully!',
  });
});
