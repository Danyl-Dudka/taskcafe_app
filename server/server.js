import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Task } from "./models/Task.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticateToken } from "./middleWares/auth.js";
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, login, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).send({ message: "Error" });
  }
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return res.status(400).send({ message: "Login is incorrect!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Password is incorrect!" });
    }

    const token = jwt.sign(
      { userId: user._id, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, fullname: user.fullname, message: "Login successful!" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Server error!" });
  }
});

app.post("/settings", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User is not found!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect!" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "Confirmaton of password does not match!" });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "New password must be different!" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error!" });
  }
});

app.post("/addTask", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const {
    projectName,
    projectDescription,
    projectPriority,
    projectAssignedUser,
    projectDeadline,
    projectStatus,
    projectDate,
  } = req.body;

  try {
    const newTask = new Task({
      projectName,
      projectDescription,
      projectPriority,
      projectAssignedUser,
      projectDeadline: projectDeadline ? new Date(projectDeadline) : null,
      projectDate: projectDate ? new Date(projectDate) : new Date(),
      projectStatus: projectStatus || "todo",
      user: userId,
    });
    await newTask.save();
    res.json({ message: "Task was successfully created!" });
  } catch (error) {
    console.error("Task is not created:", error);
    res.status(500).send({ message: "Error" });
  }
});

app.post("/addSubtask", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { projectId, subTaskName, subTaskDescription } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "Project is not defined!" });
  }

  if (!subTaskName) {
    return res.status(400).json({ message: "Subtask name is required!" });
  }
  try {
    const task = await Task.findOne({ _id: projectId, user: userId });
    if (!task) {
      return res.status(404).send({ message: "Task is not found!" });
    }

    task.subtasks.push({ subTaskName, subTaskDescription });

    await task.save();
    res.json({ message: "Subtask added successfully!" });
  } catch (error) {
    console.error("Failed to add subtask: ", error);
    res.status(500).json({ message: "Server error!" });
  }
});

app.get("/getSubtasks", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.query.taskId;

  if (!taskId) {
    return res.status(400).json({ message: "Task ID is required!" });
  }

  try {
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return res.status(400).json({ message: "Task is not defined!" });
    }

    res.json(task.subtasks || []);
    
  } catch (error) {
    console.error("Error fetching subtasks: ", error);
    res.status(500).json({ message: "Server error!" });
  }
});

app.get("/getTasks", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const tasks = await Task.find({ user: userId });
    if (!tasks) {
      return res.status(400).send({ message: "No results" });
    }
    res.json(tasks);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.post("/resetTasks", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User is not found!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect!" });
    }

    await Task.deleteMany({ user: userId });
    res.status(200).json({ message: "All tasks deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tasks: ", error });
  }
});

app.put("/editTask", authenticateToken, async (req, res) => {
  const {
    projectId,
    editedProjectName,
    editedProjectDescription,
    editedProjectStatus,
    editedProjectPriority,
    editedAssignedUser,
  } = req.body;
  try {
    const updatedProject = await Task.findByIdAndUpdate(projectId, {
      projectName: editedProjectName,
      projectDescription: editedProjectDescription,
      projectStatus: editedProjectStatus,
      projectPriority: editedProjectPriority,
      projectAssignedUser: editedAssignedUser,
    });
    if (!updatedProject) {
      return res
        .status(404)
        .send({ message: "Project to update was not found!" });
    }
    res.json({ message: "Project has been successfully updated!" });
  } catch (error) {
    res.status(500).send({ message: "Server error!" });
  }
});

app.delete("/deleteTask", authenticateToken, async (req, res) => {
  const { projectIdToDelete } = req.body;
  try {
    const deletingProject = await Task.findByIdAndDelete(projectIdToDelete);
    if (!deletingProject) {
      return res
        .status(404)
        .send({ message: "Project to delete was not found" });
    }
    res.json({ message: "Project has been successfully deleted!" });
  } catch (error) {
    res.status(500).send({ message: "Server error!" });
  }
});

app.put("/assignUser", authenticateToken, async (req, res) => {
  const { taskId, assignedUser } = req.body;
  try {
    const assignUser = await Task.findByIdAndUpdate(
      taskId,
      { assignedUser: assignedUser },
      { new: true }
    );
    if (!assignUser) {
      return res.status(404).send({ message: " Task is not found!" });
    }
    res.json({ message: "User assigned successfully!", assignUser });
  } catch (error) {
    res.status(500).send({ message: "Server error!" });
  }
});

app.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, "fullname");
    if (!users) {
      return res.status(404).send({ message: "Users is not defined!" });
    }
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error!" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
