import express from "express";
import Cart from "../models/Cart.js";
import { auth } from "../middleware/index.js";
import Product from "../models/Product.js";

const router = express.Router();

// create cart
// add items to cart

// get cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "title price images"
    );
    if (!cart) {
      return res.status(200).json({ user: req.user._id, items: [] });
    }

    // return the cart
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get cart items

export default router;
