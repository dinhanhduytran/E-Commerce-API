import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to Database ${conn.connection.host}`);
  } catch (e) {
    console.log("Error connecting to database", e);
    process.exit(1); //exit with failure
  }
};
