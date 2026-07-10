import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// ហៅការកំណត់ Environment Variables
dotenv.config();

// ភ្ជាប់ទៅកាន់ MongoDB Atlas Database
connectDB();

const app = express();

// ==========================================
// 1. Middlewares មូលដ្ឋាន
// ==========================================
app.use(cors()); // អនុញ្ញាតឱ្យ Frontend ផ្សេងៗអាចមកហៅ API នេះបាន
app.use(express.json()); // អនុញ្ញាតឱ្យប្រព័ន្ធទទួលទិន្នន័យជាប្រភេទ JSON (req.body)
app.use(express.urlencoded({ extended: true })); // អនុញ្ញាតឱ្យទទួល Form ទិន្នន័យ

// ==========================================
// 2. ការកំណត់ API Endpoints (Routes)
// ==========================================
app.use("/api/products", productRoutes); 
app.use("/api/categories", categoryRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/cart',cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);


// ផ្លូវសាកល្បងនៅលើ Browser (Root Route)
app.get("/", (req, res) => {
  res.send("Phone Shop API កំពុងដំណើរការយ៉ាងរលូន...");
});

// ==========================================
// 3. Middlewares សម្រាប់ចាប់ Error (Best Practice)
// ==========================================

// កំហុសករណីរកមិនឃើញផ្លូវ URL (404 Not Found)
app.use((req, res, next) => {
  const error = new Error(
    `រកមិនឃើញផ្លូវ URL ដែលអ្នកកំពុងស្វែងរកឡើយ: ${req.originalUrl}`,
  );
  res.status(404);
  next(error);
});

// កំហុសទូទៅរបស់ Server (500 Internal Server Error)
app.use((err, req, res, next) => {
  // បើសិនជា status កូដស្មើ ២០០ (ជោគជ័យ) តែមាន Error ត្រូវប្តូរទៅ ៥០០ ភ្លាម
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: "មានបញ្ហាបច្ចេកទេសនៅខាង Server: " + err.message,
    // បង្ហាញកន្លែងខុស (stack) តែពេលកំពុងធ្វើកូដ (Development) ប៉ុណ្ណោះ ពេលផលិតពិត (Production) ត្រូវលាក់វិញ
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ==========================================
// 4. បើកដំណើរការ Server
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
