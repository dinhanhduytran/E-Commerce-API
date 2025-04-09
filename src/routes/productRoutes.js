import express from "express";
import Product from "../models/Product.js";
import { auth, adminAuth } from "../middleware/index.js";
import upload from "../middleware/upload.js";
import { cloudinary } from "../config/cloudinary.js";
import Category from "../models/Category.js";

const router = express.Router();

// get all products
router.get("/", async (req, res) => {
  try {
    // todo: pagination
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).populate("category", "name");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {}
});

// create product
router.post(
  "/",
  auth,
  adminAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { title, price, description, stock, category } = req.body;
      const files = req.files;
      if (
        !title ||
        !price ||
        !description ||
        !stock ||
        !category ||
        !files ||
        files.length === 0
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Category does not exist" });
      }

      // Extract Cloudinary URLs from req.files
      const imageUrls = files.map((file) => file.path);

      // Create product
      const product = new Product({
        title,
        price,
        description,
        stock,
        category,
        images: imageUrls,
      });
      await product.save();

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
// update product
router.put(
  "/:id",
  auth,
  adminAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, price, description, stock, category } = req.body;
      const files = req.files;

      // check if product exists
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // check if category exists
      if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }

      // update product
      product.title = title || product.title;
      product.price = price || product.price;
      product.description = description || product.description;
      product.stock = stock || product.stock;
      product.category = category || product.category;
      if (files && files.length > 0) {
        if (product.images && product.images.length > 0) {
          // delete old images from cloudinary
          const oldImages = product.images;
          for (const image of oldImages) {
            // https://res.cloudinary.com/dfccklg0w/image/upload/v1744169426/ecommerce-products/twjkg2cw0mdzbyrcvl59.png
            // get this part: ecommerce-products/twjkg2cw0mdzbyrcvl59.png
            const publid_id = image
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];
            await cloudinary.uploader.destroy(publid_id);
          }
        }
        // Extract Cloudinary URLs from req.files
        const imageUrls = files.map((file) => file.path);
        product.images = imageUrls;
      }
      await product.save();

      res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// delete product
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("hi");
    console.log("produtct", product);
    // delete product
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        const public_id = image.split("/").slice(-2).join("/").split(".")[0];
        console.log("public_id", public_id);
        await cloudinary.uploader.destroy(public_id);
      }
    }
    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
