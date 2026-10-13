import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URL = process.env.MongoDB_URL;
if (!MONGODB_URL) {
  throw new Error(
    "MongoDB url is missing please check enviroment varraiables...",
  );
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL as string);
    console.log("mongodb connected successfully...");
  } catch (error) {
    console.error("mongodb connection failed");
    throw new Error("mongodb connection failed");
  }
};
