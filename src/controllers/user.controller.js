import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const registerUser = asyncHandler( async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const {fullName, email, username, password } = req.body
  

  if (
      [fullName, email, username, password].some((field) => field === undefined || (field.trim() === ""))
  ) {
   
      throw new ApiError(400, "All fields are required")
  }
   
  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }
  //console.log(req.files);

    
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let avatarLocalPath;
  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
      avatarLocalPath = req.files.avatar[0].path
  }

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }
  

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
  }
 

  const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email, 
      password,
      username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )

} )

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // ***req.body -> data

  const { email, username, password } = req.body;
 
  // usename or email
  //  both username and email needed  if for either one use &&
  if (!username && !email) {
    throw new ApiError(400, "either username or email is required");
  }

  // find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  
  // password check
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "inavlid User credentials");
  }

  // access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return (
    res
      .status(200)
      // sent as a cookies
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        // sent resposne as "login succesfull"
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken, // not necessary to sent this here, as we already have a cookie, if you need immediate access then snet it
            refreshToken,
          },
          "User logged In Succesfully"
        )
      )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
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
    .json(new ApiResponse(200, "user logout succesfully"));
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

 if (!incomingRefreshToken){
  throw new ApiError(401,"unauthorized request")
 }

 try {
  const decodedToken =jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)
  const user = await User.findById(decodedToken?._id)
  if (!user){
   throw new ApiError(401,"invalid refresh Token")
  }
  if (incomingRefreshToken !== user?.refreshToken){
   throw new ApiError(401,"Refresh token is expired or used")
  }
 
  const options={
   httpOnly:true,
   secure:true
  }
  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
 
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
   new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed")
  )
 } catch (error) {
  throw new ApiError(401,error?.message || "invalid refresh Token")
  
 }

})

export { registerUser, loginUser, logoutUser, refreshAccessToken };
