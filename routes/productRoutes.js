import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/productController.js";
import upload from "../middleware/uploadMiddleware.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/search/filter", searchProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

// ខាងលើនេះ User ធម្មតា ឬភ្ញៀវមិនទាន់ Login ក៏អាចមើលផលិតផលបាន
// ខាងក្រោមនេះ ត្រូវតែ Login ផង និងត្រូវតែជា Admin ផង ទើបធ្វើបាន

router.post("/", protect,admin, upload.array("images", 5), createProduct);
router.put("/:id", protect,admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect,admin, deleteProduct);

export default router;
