import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { fileUploader } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details form frontend
  // validate details - if empty
  // check if user already exists - using email or username
  // check for images - avatar
  // upload them to cloudinary
  // create entry in db
  // return a response without password and refresh token

  const { username, fullname, email, password } = req.body;
  if ([username, fullname, email, password].some((f) => f?.trim() === "")) {
    console.log("error");
    throw new ApiError(400, "All feilds except Cover Image is required!");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) throw new ApiError(409, "User already exists");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(409, "Please upload avatar");
  }

  const avatar = await fileUploader(avatarLocalPath);
  const coverImage = await fileUploader(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is Required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
    email,
    username,
  });

  const createdUser = User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // already logged in
  // access token and refresh token ke through check krege
  // take data and verify

  const { username, email, password } = req.body;
  console.log(email);
  if (!(username || email)) {
    throw new ApiError(400, "Either username or password is required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new ApiError(401, "User not found");
  const isCorrect = user.isPasswordCorrect(password);
  if (!isCorrect) throw new ApiError(404, "Password Incorrect");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("Access Token", accessToken, options)
    .cookie("Refresh Token", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        "Logged-In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const userToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!userToken) throw new ApiError(401, "User Token Invalid");
    const decodedToken = jwt.verify(userToken, process.env.ACCESS_TOKEN_KEY);
    const user = await User.findById(decodedToken._id);
    if (!user) throw new ApiError(402, "User Not Found");
    if (user.refreshToken !== decodedToken)
      throw new ApiError(400, "User not found");
    const { accessToken, refreshToken } = generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("Access Token", accessToken, options)
      .cookie("Refresh Token", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { refreshToken, accessToken },
          "Logged-In Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Server not responding");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
