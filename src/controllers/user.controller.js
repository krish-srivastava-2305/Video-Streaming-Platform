import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { fileUploader } from "../utils/cloudinary.js";

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

  const existingUser = User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) throw new ApiError(409, "User already exists");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
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
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

export { registerUser };
