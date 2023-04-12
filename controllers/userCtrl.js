const { generateToken } = require("../config/generateToken");
const User = require("../models/userModel");

const createUser = async (req, res) => {
  const email = req.body.email;
  try {
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      const newUser = await User.create(req.body);
      res.json({
        status: true,
        msg: "User Created Successfully",
        code: "USER_REGISTERED",
        data: newUser,
      });
    } else {
      res.json({
        status: false,
        msg: "User Already Resgistered",
        code: "USER_ALREADY_REGISTERED",
      });
    }
  } catch (err) {
    res.json({
      status: true,
      msg: "Something went wrong!",
      code: "USER_REGISTRATION_FAILED",
      error: err,
    });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    res.json({
      status: true,
      msg: "User Logged In Successfully",
      code: "USER_LOGGED_IN",
      data: {
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?._id),
      },
    });
  } else {
    res.json({
      status: false,
      msg: "Something went wrong!",
      code: "USER_LOGIN_FAILED",
    });
  }
};

const getUser = async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id);
    res.json({
      staus: true,
      msg: "User Fetched Successfully",
      code: "USER_GET_SUCCESS",
      data: findUser,
    });
  } catch (error) {
    res.json({
      status: false,
      msg: "Something went wrong!",
      code: "USER_GET_FAILED",
      error: error,
    });
  }
};

const followAUser = async (req, res) => {
  
  const { id } = req.params;
  const loginUserId = req.user.id;

  
  const targetUser = await User.findById(id);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing) {
    res.json({
      status: false,
      msg: "You have already followed this user",
      code: "USER_ALREADY_FOLLOWED",
    });
  }

  
  await User.findByIdAndUpdate(
    id,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: id },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
};
const unfollowAUser = async (req, res) => {
  const { id } = req.params;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    id,
    {
      $pull: { followers: loginUserId },
      isFollowing: false,
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: id },
    },
    { new: true }
  );

  res.json("You have successfully unfollowed this user");
};

module.exports = { createUser, loginUser, getUser, followAUser, unfollowAUser };
