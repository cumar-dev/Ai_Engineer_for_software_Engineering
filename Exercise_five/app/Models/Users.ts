import mongoose, { models, Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
  },
  favourite_genre: {
    type: String,
    required: true,
    trim: true,
  },
});

export const Users = models.Users || mongoose.model("Users", userSchema);
