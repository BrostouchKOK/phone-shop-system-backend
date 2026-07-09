import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

// មុខងារបង្កើត JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    ចុះឈ្មោះសមាជិកថ្មី (Register User)
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email នេះត្រូវបានប្រើប្រាស់រួចហើយ!",
      });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      message: "បានចុះឈ្មោះគណនីជោគជ័យ!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

// @desc    ឡុកអ៊ីនជំហានទី ១ (Login - ផ្ញើ OTP)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email ឬ លេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ!",
      });
    }

    // បង្កើតលេខ OTP ៦ ខ្ទង់ចៃដន្យ (Random 6 digits)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // កំណត់ឱ្យ OTP នេះរស់បានតែ ៥ នាទីប៉ុណ្ណោះ
    user.otp = otpCode;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // ផ្ញើ OTP ទៅកាន់ Email User
    try {
      await sendEmail({
        email: user.email,
        subject: "🔒 លេខកូដ OTP សម្រាប់ផ្ទៀងផ្ទាត់ការ Login",
        html: `<h3>សូមប្រើប្រាស់លេខកូដខាងក្រោមដើម្បី Login ចូលប្រព័ន្ធ៖</h3>
               <h1 style="color: #4CAF50; letter-spacing: 5px;">${otpCode}</h1>
               <p style="color: red;">*លេខកូដនេះមានសុពលភាពត្រឹមតែ ៥ នាទីប៉ុណ្ណោះ!</p>`,
      });

      res.status(200).json({
        success: true,
        message:
          "លេខកូដ OTP ត្រូវបានផ្ញើទៅកាន់ Email របស់អ្នកហើយ។ សូមពិនិត្យមើល Email!",
      });
    } catch (mailError) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "មិនអាចផ្ញើ Email បានឡើយ: " + mailError.message,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

// @desc    ឡុកអ៊ីនជំហានទី ២ (Verify OTP - វាយតែលេខ OTP ប៉ុណ្ណោះ)
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body; // 👈 ទទួលយកតែ otp មួយគត់ពី Frontend

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "សូមបញ្ចូលលេខកូដ OTP!" });
    }

    // ស្វែងរក User ណាដែលមានលេខ OTP ត្រូវគ្នានឹងការវាយបញ្ចូល ហើយ OTP នោះមិនទាន់ហួសកំណត់
    const user = await User.findOne({
      otp: otp,
      otpExpires: { $gt: Date.now() }, // $gt មានន័យថា Greater Than (ពេលវេលាហួសកំណត់ ត្រូវធំជាង ពេលបច្ចុប្បន្ន)
    });

    // បើរករកមិនឃើញ ឬហួសកំណត់ វានឹងរត់ចូលលក្ខខណ្ឌនេះ
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "លេខ OTP មិនត្រឹមត្រូវ ឬបានហួសកំណត់ (Expired) ទៅហើយ!",
      });
    }

    // លុប OTP ចោលវិញក្រោយផ្ទៀងផ្ទាត់រួច ដើម្បីកុំឱ្យយកមកប្រើឡើងវិញបាន
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // បាញ់ Token ឱ្យទៅ Frontend ជាផ្លូវការ
    res.status(200).json({
      success: true,
      message: "ការផ្ទៀងផ្ទាត់ជោគជ័យ! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ។",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};
