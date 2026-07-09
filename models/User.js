import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    // សម្រាប់ផ្ទុកទិន្នន័យ OTP
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true },
);

// Middleware សម្រាប់ Hash Password ស្វ័យប្រវត្តមុនពេលរក្សាទុកទៅក្នុង Database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method សម្រាប់ផ្ទៀងផ្ទាត់ Password ពេល Login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
