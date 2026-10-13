import { models, Schema } from "mongoose";
import mongoose from "mongoose";
const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  genre: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  director: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
});

export const Movies = models.Movies || mongoose.model("Movies", movieSchema);
