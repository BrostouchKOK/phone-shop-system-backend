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

const router = express.Router();

// 1. ផ្លូវសម្រាប់ស្វែងរកផលិតផល (Search & Filter)
// URL: GET /api/products/search/filter
router.get("/search/filter", searchProducts);

// 2. ផ្លូវសម្រាប់ទាញយកផលិតផលទាំងអស់
// URL: GET /api/products
router.get("/", getProducts);

// 3. ផ្លូវសម្រាប់បង្កើតផលិតផលថ្មី (មាន Upload រូបភាពបាន ៥ សន្លឹក)
// URL: POST /api/products
router.post("/", upload.array("images", 5), createProduct);

// 4. ផ្លូវសម្រាប់មើលព័ត៌មានលម្អិតនៃផលិតផលមួយគ្រឿងតាម ID
// URL: GET /api/products/:id
router.get("/:id", getProductById);

// 5. ផ្លូវសម្រាប់កែប្រែព័ត៌មានផលិតផលតាម ID (អាចដូររូបភាពបាន)
// URL: PUT /api/products/:id
router.put("/:id", upload.array("images", 5), updateProduct);

// 6. ផ្លូវសម្រាប់លុបផលិតផលចេញតាម ID
// URL: DELETE /api/products/:id
router.delete("/:id", deleteProduct);

export default router;
