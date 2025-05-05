import express from "express";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request bodies

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.message || err.toString());
  res.status(500).json({ message: err.message || "Something went wrong." });
});
