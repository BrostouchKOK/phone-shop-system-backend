import Product from "../models/Product.js";
import Category from "../models/Category.js";

// @desc    បង្កើតផលិតផលថ្មី (ទូរស័ព្ទ)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, brand, category, price, description, stock } = req.body;

    // ចាប់យក Cloudinary URLs ពី Multer
    const images = req.files ? req.files.map((file) => file.path) : [];

    // ពិនិត្យលក្ខខណ្ឌព័ត៌មានដែលចាំបាច់ (Validation)
    if (!name || !brand || !category || !price) {
      return res.status(400).json({
        success: false,
        message:
          "សូមបំពេញព័ត៌មានដែលចាំបាច់ឱ្យបានគ្រប់គ្រាន់ (ឈ្មោះ, ម៉ាក, ប្រភេទ, តម្លៃ)!",
      });
    }

    // ពិនិត្យមើលថាតើ Category ID ដែលផ្ញើមកមានពិតមែនដែរឬទេ
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "រកមិនឃើញប្រភេទផលិតផលដែលអ្នកបានជ្រើសរើសឡើយ!",
      });
    }

    // ពិនិត្យមើលរូបភាព
    if (!images || images.length === 0 || !images[0]) {
      return res.status(400).json({
        success: false,
        message: "សូមបញ្ចូលរូបភាពផលិតផលយ៉ាងហោចណាស់ ១ សន្លឹក!",
      });
    }

    const product = new Product({
      name: name.trim(),
      brand: brand.trim(),
      category,
      price,
      description,
      stock,
      images,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "បានបន្ថែមផលិតផលថ្មីចូលក្នុងប្រព័ន្ធដោយជោគជ័យ!",
      data: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាបច្ចេកទេសនៅខាង Server: " + error.message,
    });
  }
};

// @desc    ទាញយកផលិតផលទាំងអស់
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    // ១. កំណត់យក Page និង Limit ពី URL (បើអត់ផ្ញើមកទេ យកទំព័រទី ១ និងបង្ហាញម្តង ៨ គ្រឿងជា Default)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;

    // ២. គណនាចំនួនទិន្នន័យដែលត្រូវរំលង (Skip)
    // ឧទាហរណ៍៖ បើ Page 2 គឺត្រូវ Skip (2-1) * 8 = រំលង ៨ គ្រឿងដំបូង ចាប់យកពីគ្រឿងទី ៩ ទៅ
    const skip = (page - 1) * limit;

    // ៣. រាប់ចំនួនផលិតផលសរុបដែលមានក្នុង Database
    const totalProducts = await Product.countDocuments();

    // ប្រើ .populate('category', 'name') ដើម្បីទាញយកឈ្មោះ Category មកបង្ហាញជាមួយ
    const products = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // ៥. គណនាចំនួនទំព័រសរុប
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      message: "ទាញយកទិន្នន័យផលិតផលបានជោគជ័យ!",
      pagination: {
        totalProducts, // ចំនួនផលិតផលសរុបទាំងអស់ (ឧទាហរណ៍៖ ១០០ គ្រឿង)
        totalPages, // ចំនួនទំព័រសរុប (ឧទាហរណ៍៖ ១០០/៨ = ១៣ ទំព័រ)
        currentPage: page, // ទំព័របច្ចុប្បន្ន
        limit, // ចំនួនបង្ហាញក្នុងមួយទំព័រ
      },
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "មានបញ្ហាបច្ចេកទេសនៅខាង Server: " + error.message,
    });
  }
};

// @desc    ទាញយកទិន្នន័យទូរស័ព្ទមួយគ្រឿង (Get Single Product)
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញផលិតផលនេះឡើយ!" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};

// @desc    កែប្រែព័ត៌មានផលិតផល (Update Product)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { name, brand, category, price, description, stock } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញផលិតផលសម្រាប់កែប្រែឡើយ!" });
    }

    // ប្រសិនបើមានការ Upload រូបភាពថ្មី ត្រូវយកអាថ្មី បើអត់ទេទុករូបចាស់ដដែល
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    product.name = name?.trim() || product.name;
    product.brand = brand?.trim() || product.brand;
    product.category = category || product.category;
    product.price = price || product.price;
    product.description = description || product.description;
    product.stock = stock || product.stock;
    product.images = images;

    const updatedProduct = await product.save();
    res.status(200).json({
      success: true,
      message: "បានកែប្រែព័ត៌មានផលិតផលជោគជ័យ!",
      data: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};

// @desc    លុបផលិតផល (Delete Product)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញផលិតផលដែលត្រូវលុបឡើយ!" });
    }

    await product.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "បានលុបផលិតផលចេញពីប្រព័ន្ធរួចរាល់!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};

// @desc    ស្វែងរក និងចម្រាញ់ផលិតផល (Search & Filter Products)
// @route   GET /api/products/search/filter
export const searchProducts = async (req, res) => {
  try {
    const { keyword, brand, category, minPrice, maxPrice } = req.query;
    let query = {};

    // 1. ស្វែងរកតាមពាក្យគន្លឹះ (ឈ្មោះ ឬការពិពណ៌នា)
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" }; // 'i' មានន័យថា មិនប្រកាន់អក្សរតូចធំ
    }
    // 2. ស្វែងរកតាមម៉ាក (Brand)
    if (brand) {
      query.brand = brand;
    }
    // 3. ស្វែងរកតាមប្រភេទ (Category ID)
    if (category) {
      query.category = category;
    }
    // 4. ស្វែងរកតាមចន្លោះតម្លៃ (Price Range)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice); // ធំជាង ឬស្មើ
      if (maxPrice) query.price.$lte = Number(maxPrice); // តូចជាង ឬស្មើ
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8; // បង្ហាញម្តង ៨ គ្រឿង
    const skip = (page - 1) * limit;

    //រាប់ចំនួនផលិតផលសរុបដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរក (មិនមែនទាំងអស់ក្នុង DB ទេ)
    const totalMatchedProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // គណនាចំនួនទំព័រសរុបនៃលទ្ធផលស្វែងរក
    const totalPages = Math.ceil(totalMatchedProducts / limit);

    res.status(200).json({
      success: true,
      pagination: {
        totalProducts: totalMatchedProducts, // ចំនួនដែលរកឃើញ (ឧទាហរណ៍៖ ឃើញតែ ២០ គ្រឿងដែលជា iPhone)
        totalPages, // ចំនួនទំព័រសរុប (២០/៨ = ៣ ទំព័រ)
        currentPage: page,
        limit,
      },
      data: products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "មានបញ្ហាបច្ចេកទេស: " + error.message });
  }
};
