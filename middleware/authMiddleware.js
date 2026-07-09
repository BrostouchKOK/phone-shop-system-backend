import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ១. Middleware សម្រាប់ពិនិត្យថា តើបាន Login ឬនៅ (មាន Token អត់)
export const protect = async (req, res, next) => {
  let token;

  // ពិនិត្យមើលថាតើមានផ្ញើ Token មកតាម Header (Authorization: Bearer <TOKEN>) ដែរឬទេ
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // កាត់យកតែខ្សែអក្សរ Token សុទ្ធ (លុបពាក្យ Bearer ចេញ)
      token = req.headers.authorization.split(" ")[1];

      // ផ្ទៀងផ្ទាត់ Token ជាមួយ Secret Key ក្នុង .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ទៅទាញយកទិន្នន័យ User ពី DB តាម ID ដែលបង្កប់ក្នុង Token (តែមិនយក Password មកទេ)
      req.user = await User.findById(decoded.id).select("-password");

      // អនុញ្ញាតឱ្យរត់ទៅកាន់ Controller បន្ទាប់
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message:
          "Token មិនត្រឹមត្រូវ ឬបានហួសកំណត់ សិទ្ធិចូលប្រើប្រាស់ត្រូវបានបដិសេធ!",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "មិនមានសិទ្ធិចូលប្រើប្រាស់ឡើយ ព្រោះគ្មាន Token ភ្ជាប់មកជាមួយ!",
    });
  }
};

// ២. Middleware សម្រាប់ពិនិត្យសិទ្ធិជា Admin (Authorization)
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // បើជា Admin មែន ឱ្យទៅមុខទៀតបាន
  } else {
    res.status(403).json({
      success: false,
      message:
        "សកម្មភាពត្រូវបានបដិសេធ! ទាល់តែគណនីជា Admin ទើបអាចប្រើប្រាស់មុខងារនេះបាន។",
    });
  }
};
