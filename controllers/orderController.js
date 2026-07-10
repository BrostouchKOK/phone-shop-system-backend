import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    បង្កើតការបញ្ជាទិញថ្មី (Create New Order & Decrease Stock)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // 1. ទាញយកទំនិញពីកន្ត្រករបស់ User
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "កន្ត្រកទំនិញរបស់អ្នកនៅទទេឡើយ មិនអាចកម្ម៉ង់បានទេ!",
      });
    }

    // 2. រៀបចំទិន្នន័យទំនិញសម្រាប់ Order និងគណនាតម្លៃសរុប ព្រមទាំងពិនិត្យស្តុកម្តងទៀត
    let orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;

      // ពិនិត្យមើលក្រែងលោមាននរណាម្នាក់ទិញកាត់មុខអស់ស្តុកមុននេះ
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `ទូរស័ព្ទ ${product.name} មិនមានស្តុកគ្រប់គ្រាន់ទេ! សល់ត្រឹមតែ ${product.stock} គ្រឿងប៉ុណ្ណោះ។`,
        });
      }

      // បូកបញ្ចូលទៅក្នុងបញ្ជីទំនិញបញ្ជាទិញ
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      // គណនាតម្លៃសរុប
      totalPrice += product.price * item.quantity;
    }

    // 3. បង្កើត Order ទៅក្នុង Database
    const order = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const savedOrder = await order.save();

    // 4. 🛠️ ដំណាក់កាលកាត់ស្តុក៖ ធ្វើបច្ចុប្បន្នភាពស្តុកទូរស័ព្ទក្នុង Product Schema
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }, // $inc: -quantity មានន័យថាកាត់ដកចំនួនចេញ
      });
    }

    // 5. សម្អាតកន្ត្រកទំនិញរបស់ User នោះចោលវិញ
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "ការបញ្ជាទិញរបស់អ្នកបានជោគជ័យហើយ!",
      data: savedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "orderItems.product",
        select: "images name",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    //ទាញយកព័ត៌មាន user ដោយថែម field "role" មកជាមួយដើម្បីភាពច្បាស់លាស់
    const orders = await Order.find({})
      .populate("user", "name email role")
      .populate("orderItems.product", "images name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // ចាប់យក Status ថ្មីពី Frontend (ឧទាហរណ៍៖ "Processing")
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "រកមិនឃើញវិក្កយបត្រនេះទេ!" });
    }

    // កែប្រែស្ថានភាព
    order.status = status;

    // ប្រសិនបើស្ថានភាពប្តូរទៅជា Delivered (បានប្រគល់ជោគជ័យ) ឱ្យដូរស្ថានភាពទូទាត់លុយជា true តែម្តង
    if (status === "Delivered") {
      order.isPaid = true;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពទៅជា "${status}" ជោគជ័យ!`,
      data: updatedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};
