import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // រក្សាទុកឈ្មោះទូរស័ព្ទការពារក្រែងក្រោយមកយើងប្តូរឈ្មោះក្នុង Product
  price: { type: Number, required: true }, // រក្សាទុកតម្លៃពេលទិញជាក់ស្តែង
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, default: 0.0 },
    paymentMethod: { type: String, required: true, default: "COD" }, // COD: Cash on Delivery
    isPaid: { type: Boolean, required: true, default: false },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
