import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    ថែមទូរស័ព្ទចូលក្នុងកន្ត្រកទំនិញ (Add or Update Item in Cart)
// @route   POST /api/cart
// @access  Private (ទាល់តែ Login រួច)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // បានមកពី protect middleware

    // 1. ពិនិត្យមើលថាតើមានផលិតផលនោះពិតមែនអត់ និងពិនិត្យស្តុក
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញផលិតផលនេះឡើយ!" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `ស្តុកមិនគ្រប់គ្រាន់ឡើយ! សល់ត្រឹមតែ ${product.stock} គ្រឿងប៉ុណ្ណោះ។`,
      });
    }

    // 2. ស្វែងរកកន្ត្រកទំនិញរបស់ User ម្នាក់នេះ
    let cart = await Cart.findOne({ user: userId });

    // បើ User មិនទាន់មានកន្ត្រកទំនិញសោះ គឺបង្កើតថ្មីមួយឱ្យគាត់
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // 3. ពិនិត្យមើលថាតើទូរស័ព្ទម៉ូដែលនេះមានក្នុងកន្ត្រករួចហើយឬនៅ?
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      // បើមានរួចហើយ គឺថែមចំនួន (Quantity) បញ្ចូលបន្ថែម
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      // បើមិនទាន់មានទេ គឺរុញ (Push) ចូលជា Item ថ្មី
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    res.status(200).json({
      success: true,
      message: "បានដាក់ចូលកន្ត្រកទំនិញជោគជ័យ!",
      data: cart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

// @desc    ទាញយកទិន្នន័យក្នុងកន្ត្រកទំនិញរបស់ User ម្នាក់ៗ
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    // ទាញយកកន្ត្រកទំនិញមកបង្ហាញ ព្រមទាំងទាញព័ត៌មានលម្អិតរបស់ Product (ឈ្មោះ, តម្លៃ, រូបភាព)
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock",
    );

    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

// @desc    លុបទំនិញចេញពីកន្ត្រកទំនិញ
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញកន្ត្រកទំនិញឡើយ!" });
    }

    // ច្រោះយកតែ Item ណាដែលមិនមែនជា Product ID ដែលចង់លុប
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId,
    );

    await cart.save();
    res
      .status(200)
      .json({
        success: true,
        message: "បានលុបទំនិញចេញពីកន្ត្រករួចរាល់!",
        data: cart,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};
