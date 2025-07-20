import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  projectDescription: {
    type: String,
  },
  projectPriority: {
    type: String,
    required: true,
  },
  projectDeadline: {
    type: Date || null,
  },
  projectStatus: {
    type: String,
    default: "todo",
  },
  projectDate: {
    type: Date,
    default: Date.now,
  },
  projectAssignedUser: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subtasks: [
    {
      subTaskName: { type: String, required: true },
      subTaskDescription: {type: String, default: 'Subtask description is not provided'},
    },
  ],
});

export const Task = mongoose.model("Task", taskSchema);
