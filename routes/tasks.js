import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendNotificationToUser } from "./fcm.js";

const router = express.Router();

// 🔐 Auth Middleware: Verifies JWT and sets req.userId
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid Token" });
  }
};

// 📄 GET all tasks of logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ POST a new task
router.post("/", auth, async (req, res) => {
  const { title, description, deadline, category, priority, subtasks, recurring } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const task = new Task({
      user: req.userId,
      title,
      description,
      deadline,
      category: category || '',
      priority: priority || '',
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      recurring: recurring || 'none',
    });

    await task.save();

    // Send push notification for new task creation (if it has a deadline)
    if (deadline) {
      const user = await User.findById(req.userId);
      if (user?.notificationPrefs?.browser) {
        const notification = {
          title: "📝 New Task Created",
          body: `"${title}" is due on ${new Date(deadline).toLocaleDateString()}`
        };
        await sendNotificationToUser(req.userId, notification);
      }
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ DELETE a task by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PATCH: Mark a task as completed
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { completed: true },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: "Task not found" });

    // Send push notification for task completion
    const user = await User.findById(req.userId);
    if (user?.notificationPrefs?.browser) {
      const notification = {
        title: "🎉 Task Completed!",
        body: `Great job! You've completed "${task.title}"`
      };
      await sendNotificationToUser(req.userId, notification);
    }

    // If recurring, create a new task with the next due date
    if (task.recurring && task.recurring !== 'none' && task.deadline) {
      let nextDeadline = new Date(task.deadline);
      if (task.recurring === 'daily') nextDeadline.setDate(nextDeadline.getDate() + 1);
      if (task.recurring === 'weekly') nextDeadline.setDate(nextDeadline.getDate() + 7);
      if (task.recurring === 'monthly') nextDeadline.setMonth(nextDeadline.getMonth() + 1);
      const newTask = new Task({
        user: task.user,
        title: task.title,
        description: task.description,
        deadline: nextDeadline,
        category: task.category,
        priority: task.priority,
        subtasks: (task.subtasks || []).map(st => ({ ...st, completed: false })),
        recurring: task.recurring,
      });
      await newTask.save();
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark task as completed" });
  }
});

// 📝 PATCH: Update a task (all fields)
router.patch("/:id", auth, async (req, res) => {
  const { title, description, deadline, category, priority, subtasks, recurring } = req.body;
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(deadline !== undefined && { deadline }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(subtasks !== undefined && { subtasks }),
        ...(recurring !== undefined && { recurring }),
      },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

export default router;
