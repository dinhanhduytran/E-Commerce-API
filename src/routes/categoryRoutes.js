import express from "express";
import Category from "../models/Category.js";
import { auth, adminAuth } from "../middleware/index.js";

const router = express.Router();

router.post("/", auth, adminAuth, async (req, res) => {
  try {
    const { name } = req.body;

    // validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name });
    await category.save();
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log("Error creating category", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      categories,
    });
  } catch (error) {
    console.log("Error fetching categories", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    // validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    // check if category exists
    const categoryExists = await Category.findById(id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // check if category name already exists
    const categoryNameExists = await Category.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (categoryNameExists) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    // update category
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { name },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // check if category exists
    const categoryExists = await Category.findById(id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // delete category
    await Category.findByIdAndDelete(id);
    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
