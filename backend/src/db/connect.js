import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to DB: ${connection.connection.host}`);
    } catch (error) {
        console.error("Error connecting to DB:", error.message);
        process.exit(1); // Exit process with failure
    }
};