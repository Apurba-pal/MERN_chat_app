import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/utils.js";
import cloudinary from "../utils/cloudinary.js";

export const signup = async (req, res) => {
  try {
    // res.send("signup route");
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if the password is at least 6 characters long and if the user already exists in the database
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }
    const user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Use generateToken from utils.js
      const token = generateToken(newUser._id);

      // Set the token in a cookie
      res.cookie("jwt", token, { httpOnly: true }); // Fix cookie name

      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ msg: "User creation failed" });
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set the token in a cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    // Send response
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ msg: "Internal Server error " + error.message });
  }
};

export const logout = (req, res) => {
  try {
    // Ensure the cookie name matches exactly ("jwt" in this case)
    res.cookie("jwt", "", {
      httpOnly: true, // Ensure the cookie is HTTP-only
      sameSite: "strict", // Prevent cross-site request forgery
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 0, // Expire the cookie immediately
    });
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ msg: "Profile picture is required" });
    }

    // Validate file size (assuming base64 string)
    const fileSizeInBytes = Buffer.from(profilePic.split(",")[1], "base64").length;
    const maxFileSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (fileSizeInBytes > maxFileSizeInBytes) {
      return res.status(413).json({ msg: "File size exceeds 5MB limit" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user); // Return the authenticated user's details
  } catch (error) {
    console.log("Error in checkAuth controller:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
};

// 1:12:52