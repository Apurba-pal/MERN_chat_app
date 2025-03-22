// index.js

import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/connect.js";

dotenv.config();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB()
});



// demo test

app.get("/", (req, res) => {
    res.send("Welcome to the MERN Chat App!");
});
