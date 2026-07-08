import Category from "../models/Category.js";

// @desc    បង្កើត Category ថ្មី (Admin Only)
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // ពិនិត្យមើលថាតើបានបញ្ចូលឈ្មោះដែរឬទេ
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "សូមបញ្ចូលឈ្មោះប្រភេទផលិតផល (Category name)!",
      });
    }

    // ពិនិត្យថាតើមានឈ្មោះប្រភេទនេះរួចហើយឬនៅ
    const categoryExists = await Category.findOne({ name: name.trim() });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "ប្រភេទផលិតផលនេះមាននៅក្នុងប្រព័ន្ធរួចរាល់ហើយ!",
      });
    }

    const category = new Category({ name: name.trim(), description });
    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "បង្កើតប្រភេទផលិតផលបានជោគជ័យ!",
      data: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាបច្ចេកទេសនៅខាង Server: " + error.message,
    });
  }
};

// @desc    ទាញយកប្រភេទផលិតផលទាំងអស់
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "ទាញយកទិន្នន័យប្រភេទផលិតផលបានជោគជ័យ!",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាបច្ចេកទេសនៅខាង Server: " + error.message,
    });
  }
};

// @desc    កែប្រែប្រភេទផលិតផល
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញប្រភេទផលិតផលនេះឡើយ!" });
    }

    category.name = name?.trim() || category.name;
    category.description = description || category.description;

    const updatedCategory = await category.save();
    res.status(200).json({
      success: true,
      message: "កែប្រែប្រភេទផលិតផលបានជោគជ័យ!",
      data: updatedCategory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};

// @desc    លុបប្រភេទផលិតផល
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({
          success: false,
          message: "រកមិនឃើញប្រភេទផលិតផលដែលត្រូវលុបឡើយ!",
        });
    }

    // Best Practice Check: មុននឹងលុប Category ត្រូវប្រាកដថាគ្មាន Product ណាដែលកំពុងប្រើប្រាស់វាឡើយ
    const productUsingCategory = await Product.findOne({
      category: req.params.id,
    });
    if (productUsingCategory) {
      return res.status(400).json({
        success: false,
        message:
          "មិនអាចលុបបានទេ! ព្រោះមានផលិតផលមួយចំនួនកំពុងស្ថិតក្នុងប្រភេទនេះនៅឡើយ។",
      });
    }

    await category.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "បានលុបប្រភេទផលិតផលរួចរាល់!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};
