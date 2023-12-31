const catchAsyncError = require("../../middleware/catchAsyncError");
const ErrorHandler = require("../../utils/errorhandler");
const User = require("../../models/usermodel");
const sendToken = require("../../utils/sendJWT");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
// Register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, pinCode, avatar } = req.body;

  let user = await User.find({ email: req.body.email });
  if (user.length >= 1) {
    return next(new ErrorHandler("try again with different credentials", 409));
  }
  const myCloud = await cloudinary.uploader.upload(avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  user = await User.create({
    name,
    email,
    password,
    pinCode,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res);
});

// login a user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // checking if user has given pass and email both
  if (!email || !password) {
    return next(
      new ErrorHandler("Plese check your creds before trying again", 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("check your credentials before trying again", 401)
    );
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(
      new ErrorHandler("check your credentials before trying again", 401)
    );
  }

  sendToken(user, 200, res);
});

// logout a user
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
// forgot password for a user
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // get resetpassword token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/password/reset/${resetToken}`;
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have not requested this email then, please ignore it\n\nDo not share it with anyone`;

  try {
    await sendEmail({
      email: user.email,
      subject: `WhokeDock Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// reset the forgotted password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmpassword) {
    return next(new ErrorHandler("password doesnot matched", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

// get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id });
  res.status(200).json({
    success: true,
    user,
  });
});
// update user password
exports.updateUserPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.id }).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("old password is incorrect", 400));
  }
  if (req.body.newPassword.length < 8) {
    return next(new ErrorHandler("Password must have 8 length", 400));
  }
  if (req.body.newPassword === req.body.oldPassword) {
    return next(
      new ErrorHandler("New password should be different than old", 400)
    );
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("password doesnot matched", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// update user profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const avatarBuffer = req.body.avatar;
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // Save the buffer data as a temporary file
  if (avatarBuffer) {
    const user = await User.findById(req.user.id);
    const imgId = user.avatar.public_id;
    await cloudinary.uploader.destroy(imgId);

    const myCloud = await cloudinary.uploader.upload(avatarBuffer, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindandModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all users -- Admin
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});
// get single user details -- Admin
exports.getUserDetailsforAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`user doesnot exists with id ${req.id.params}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});
// update user role -- Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindandModify: false,
  });
  res.status(200).json({
    success: true,
  });
});
// delete user -- Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User doesnot exists wit id: ${req.params.id}`)
    );
  }
  const imgId = user.avatar.public_id;
  await cloudinary.uploader.destroy(imgId);
  await user.deleteOne();
  res.status(200).json({
    success: true,
  });
});
// send otp for password
exports.sendOtp = catchAsyncError(async (req, res, next) => {
  const email = req.body.email;
  const code = Math.floor(100000 + Math.random() * 900000);
  sendEmail({
    email: email,
    subject: "OTP for Registration",
    message: `The OPT (One Time Password) for the registration in WholeDock is :-\n\n\t\t${code} \n If you not requested this OTP, Please ignore it.\n Do not share this OTP with anyone`,
  });

  res.status(200).json({
    success: true,
    code,
  });
});
