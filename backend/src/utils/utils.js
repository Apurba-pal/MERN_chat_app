import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    if (!userId) {
        throw new Error("User ID is required to generate a token");
    }
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};