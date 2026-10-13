import mongoose, { models, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movies",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Reviews =
  models.Reviews || mongoose.model("Reviews", reviewSchema);
