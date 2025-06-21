// server/models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  deadline: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: '',
  },
  priority: {
    type: String,
    default: '',
  },
  subtasks: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
    }
  ],
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none',
  },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
