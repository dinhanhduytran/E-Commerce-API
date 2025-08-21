import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 50
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true,
        maxLength: 500
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stockQuantity: {
        type: Number,
        default: 0
    }
});
const Product = mongoose.model("Product", productSchema);
export default Product;