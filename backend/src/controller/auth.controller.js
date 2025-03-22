import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/utils.js";

export const signup = async (req, res) => {
  try {
    res.send("signup route");
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
    res.cookie("token", token, { httpOnly: true });

    // Send response
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ msg: "Internal Server error " + error.message }); // Fix cookie name
  }};


export const logout = (req, res) => {
  try {
    // Fix cookie name by removing the trailing space
    res.cookie("jwt", "", { maxAge: 0 }); 
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
};


export const updateProfile = async (req, res)=>{
  try {
    const {profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic){
      return res.status(400).json({msg: "Profile picture is required"})
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await userModel.findByIdAndUpdate( userId, {profilePic:uploadResponse.secure_url}, {new: true});
    res.status(200).json({
      updatedUser
    })

  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ msg: "Internal Server error" });    
  }

}


export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log("Error in checkAuth controller:", error);
    return res.status(500).json({ msg: "Internal Server error" });
  }
}

// 1:12:28