import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryControllers.js";

const router = express.Router();

// 1. ផ្លូវសម្រាប់ទាញយកប្រភេទផលិតផលទាំងអស់
// URL: GET /api/categories
router.get("/", getCategories);

// 2. ផ្លូវសម្រាប់បង្កើតប្រភេទផលិតផលថ្មី
// URL: POST /api/categories
router.post("/", createCategory);

// 3. ផ្លូវសម្រាប់កែប្រែប្រភេទផលិតផលតាម ID
// URL: PUT /api/categories/:id
router.put("/:id", updateCategory);

// 4. ផ្លូវសម្រាប់លុបប្រភេទផលិតផលចេញតាម ID
// URL: DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

export default router;
