import User from "../models/User.js";

// @desc    ទាញយកព័ត៌មានប្រវត្តិរូបរបស់ User (Get User Profile)
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user._id បានមកពី protect middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញគណនីនេះឡើយ!" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

// @desc    កែប្រែព័ត៌មានប្រវត្តិរូប (Update User Profile)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញគណនីនេះឡើយ!" });
    }

    // កែប្រែទិន្នន័យតាមអ្វីដែល User បោះមកពី Frontend (បើអត់បោះទេ ទុកដដែល)
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // ករណី User ចង់ដូរលេខកូដសម្ងាត់ (Password) ថ្មី
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបជោគជ័យ!",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};
