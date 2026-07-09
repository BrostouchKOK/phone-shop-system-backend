import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
} from "../controllers/authController.js";

const router = express.Router();

// 1. ផ្លូវសម្រាប់ចុះឈ្មោះសមាជិកថ្មី (Register)
// URL: POST /api/auth/register
router.post("/register", registerUser);

// 2. ផ្លូវសម្រាប់ឡុកអ៊ីនជំហានទី 1 (ផ្ញើ OTP ទៅ Email)
// URL: POST /api/auth/login
router.post("/login", loginUser);

// 3. ផ្លូវសម្រាប់ផ្ទៀងផ្ទាត់លេខ OTP (ឡុកអ៊ីនជំហានទី 2)
// URL: POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTP);

export default router;
