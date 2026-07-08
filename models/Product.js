import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],
  },
  { timestamps: true },
);

const Product = mongoose.model('Product',productSchema);
export default Product;