import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@taskcafe.i2w6awy.mongodb.net/?retryWrites=true&w=majority&appName=taskcafe`;

mongoose
  .connect(MONGO_URI, {
    dbName: "taskcafe",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/register", async (req, res) => {
  const { fullname, login, password } = req.body;
  try {
    const existingUser = await User.findOne({ login });
    if (existingUser) {
      return res.status(400).send({ message: "This login already exists" });
    }

    const newUser = new User({ fullname, login, password });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send({ message: "Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
