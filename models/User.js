import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notificationPrefs: {
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
  },
  fcmTokens: [{ type: String }], // Array to store multiple FCM tokens per user
}, { timestamps: true });

export default mongoose.model('User', userSchema);
