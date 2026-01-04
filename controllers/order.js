const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Payment = require('../models/Payment');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    console.log('Creating order with data:', { shippingAddress, paymentMethod });
    console.log('User ID:', req.user.id);

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart items
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('product', 'title price stock images');

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    console.log('Found cart items:', cartItems.length);

    // Calculate total amount and prepare order items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (!item.product) {
        console.error('Cart item has no associated product:', item);
        continue;
      }
      
      // Use correct variable name - product from populated field
      const product = item.product;
      
      // Calculate price (consider using the cached price from CartItem if available)
      const itemPrice = item.price || product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      // Add to order items
      orderItems.push({
        productId: product._id,
        title: product.title,
        quantity: item.quantity,
        price: itemPrice,
        variant: item.variant
      });

      // Decrease product stock for the specific variant
      if (product.variants && Array.isArray(product.variants)) {
        const selectedVariant = product.variants.find(
          v => v.size === item.variant.size && v.color === item.variant.color
        );

        if (selectedVariant) {
          selectedVariant.stock -= item.quantity;
          await product.save();
          console.log(`Updated stock for variant ${item.variant.size}/${item.variant.color} of product ${product._id}`);
        } else {
          console.warn(`Variant not found for product ${product._id}: ${item.variant.size}/${item.variant.color}`);
        }
      }
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalAmount,
      billingAddress: shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });
    
    console.log('Order created:', order._id);

    // Clear user's cart
    await CartItem.deleteMany({ user: req.user.id });
    console.log('Cart cleared for user:', req.user.id);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Error creating order:', err);
    next(err);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
// @desc    Get orders (Admin = all, User = own)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    console.log('Getting orders for user:', req.user.id, 'Role:', req.user.role);

    let orders;

    // ✅ ADMIN → sab users ke orders
    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate({
          path: 'items.productId',
          select: 'title images price',
          model: 'Product'
        })
        .populate('userId', 'name email') // 👈 optional (admin ko user info dikhane ke liye)
        .sort('-createdAt');
    } 
    // ✅ USER → sirf apne orders
    else {
      orders = await Order.find({ userId: req.user.id })
        .populate({
          path: 'items.productId',
          select: 'title images price',
          model: 'Product'
        })
        .sort('-createdAt');
    }

    console.log('Found orders:', orders.length);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      createdAt: order.createdAt,
      status: order.orderStatus,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.billingAddress,
      user: order.userId, // 👈 admin ke liye user info
      items: order.items.map(item => ({
        _id: item._id,
        product: item.productId || {
          _id: null,
          title: item.title || 'Product',
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      }))
    }));

    res.json({
      success: true,
      count: orders.length,
      data: formattedOrders
    });
  } catch (err) {
    console.error('Error getting orders:', err);
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    console.log('Getting order details for:', req.params.id);
    
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.productId',
        select: 'title images price',
        model: 'Product'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

// Allow admin to cancel any order
if (req.user.role === 'admin') {
  // Admin can cancel any order, continue
} else if (order.userId.toString() !== req.user.id) {
  return res.status(401).json({
    success: false,
    message: 'Not authorized to access this order'
  });
}
    
    // Format the response to match frontend expectations
    const formattedOrder = {
      _id: order._id,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      status: order.orderStatus,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.billingAddress,
      items: order.items.map(item => ({
        _id: item._id,
        product: item.productId || {
          _id: null,
          title: item.title || 'Product',
          images: []
        },
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      }))
    };

    res.json({
      success: true,
      data: formattedOrder
    });
  } catch (err) {
    console.error('Error getting order details:', err, 'for ID:', req.params.id);
    next(err);
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    console.log('Cancelling order:', req.params.id);
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Make sure user owns order
    if (order.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus !== 'processing' && order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    // Return items to stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const variant = product.variants.find(
          v => v.size === item.variant.size && v.color === item.variant.color
        );
        
        if (variant) {
          variant.stock += item.quantity;
          await product.save();
          console.log(`Returned ${item.quantity} items to stock for product ${item.productId}`);
        }
      }
    }

    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();
    
    console.log('Order cancelled successfully:', req.params.id);

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    next(err);
  }
};

// @desc    Update order to shipped status
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
exports.shipOrder = async (req, res, next) => {
  try {
    console.log('Shipping order:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update order status'
      });
    }
    
    // Check if order can be shipped
    if (order.orderStatus !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be shipped as it is currently ${order.orderStatus}`
      });
    }
    
    // Update order status to shipped
    order.orderStatus = 'shipped';
    // Also update the order's payment status to processing
    order.paymentStatus = 'processing';
    await order.save();
    
    // Update payment status to processing if there is a payment
    let payment = await Payment.findOne({ order: order._id });
    
    if (!payment) {
      // Create a new payment record if it doesn't exist
      payment = new Payment({
        order: order._id,
        user: order.userId,
        amount: order.totalAmount,
        method: order.paymentMethod || 'unknown',
        status: 'processing',
        transactionId: `ship_${order._id}_${Date.now()}`,
        paidAt: null
      });
    } else {
      payment.status = 'processing';
    }
    
    await payment.save();
    
    // Log successful payment update
    console.log('Payment updated successfully for shipped order:', {
      orderId: order._id,
      paymentId: payment._id,
      status: payment.status
    });
    
    return res.json({
      success: true,
      message: 'Order has been shipped',
      data: {
        order,
        payment
      }
    });
  } catch (err) {
    console.error('Error shipping order:', err);
    next(err);
  }
};

// @desc    Update order to delivered status
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.deliverOrder = async (req, res, next) => {
  try {
    console.log('Marking order as delivered:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update order status'
      });
    }
    
    // Special handling for orders that were manually marked as delivered
    // but payment status wasn't updated - fix inconsistent data
    if (order.orderStatus === 'delivered' && order.paymentStatus !== 'completed') {
      console.log(`Found inconsistent order ${order._id} with status 'delivered' but payment status '${order.paymentStatus}' - fixing...`);
      order.paymentStatus = 'completed';
      await order.save();
      
      // Also create or update corresponding payment record
      let payment = await Payment.findOne({ order: order._id });
      if (!payment) {
        payment = new Payment({
          order: order._id,
          user: order.userId,
          amount: order.totalAmount,
          method: order.paymentMethod || 'unknown',
          status: 'completed',
          transactionId: `deliver_fix_${order._id}_${Date.now()}`,
          paidAt: Date.now()
        });
        await payment.save();
        console.log(`Created missing payment record for delivered order ${order._id}`);
      } else if (payment.status !== 'completed') {
        payment.status = 'completed';
        payment.paidAt = Date.now();
        await payment.save();
        console.log(`Fixed payment status for delivered order ${order._id}`);
      }
      
      return res.json({
        success: true,
        message: 'Order payment status has been fixed',
        data: {
          order,
          payment
        }
      });
    }
    
    // Check if order can be delivered
    if (order.orderStatus !== 'shipped') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be delivered as it is currently ${order.orderStatus}`
      });
    }
    
    // Update order status to delivered
    order.orderStatus = 'delivered';
    // Always set the order's payment status to completed when delivered
    order.paymentStatus = 'completed';
    await order.save();
    
    // Ensure all delivered orders have their payment status set to 'completed'
    // This is a safeguard to fix any previous inconsistencies
    await Order.updateMany(
      { orderStatus: 'delivered', paymentStatus: { $ne: 'completed' } },
      { $set: { paymentStatus: 'completed' } }
    );
    
    // Update payment status to completed
    let payment = await Payment.findOne({ order: order._id });
    
    if (!payment) {
      // Create a new payment record if it doesn't exist
      payment = new Payment({
        order: order._id,
        user: order.userId,
        amount: order.totalAmount,
        method: order.paymentMethod || 'unknown',
        status: 'completed',
        transactionId: `deliver_${order._id}_${Date.now()}`,
        paidAt: Date.now()
      });
    } else {
      payment.status = 'completed';
      payment.paidAt = payment.paidAt || Date.now();
    }
    
    await payment.save();
    
    // Log successful payment update
    console.log('Payment updated successfully for delivered order:', {
      orderId: order._id,
      paymentId: payment._id,
      status: payment.status
    });
    
    return res.json({
      success: true,
      message: 'Order has been delivered',
      data: {
        order,
        payment
      }
    });
  } catch (err) {
    console.error('Error delivering order:', err);
    next(err);
  }
};

// @desc    Synchronize order payment status with payment collection
// @route   PUT /api/orders/:id/sync-payment
// @access  Private/Admin
exports.syncOrderPaymentStatus = async (req, res, next) => {
  try {
    console.log('Syncing payment status for order:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment status'
      });
    }
    
    // Find the payment for this order
    const payment = await Payment.findOne({ order: order._id });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for this order'
      });
    }
    
    // If payment status is completed but order payment status is not
    if (payment.status === 'completed' && order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      await order.save();
      
      console.log(`Order ${order._id} payment status updated to match payment record (completed)`);
      
      return res.json({
        success: true,
        message: 'Order payment status synchronized with payment record',
        data: {
          order,
          payment
        }
      });
    } else if (payment.status !== order.paymentStatus) {
      // For other cases where statuses don't match
      order.paymentStatus = payment.status;
      await order.save();
      
      console.log(`Order ${order._id} payment status updated to match payment record (${payment.status})`);
      
      return res.json({
        success: true,
        message: 'Order payment status synchronized with payment record',
        data: {
          order,
          payment
        }
      });
    }
    
    // If statuses already match
    return res.json({
      success: true,
      message: 'Order payment status already in sync with payment record',
      data: {
        order,
        payment
      }
    });
  } catch (err) {
    console.error('Error syncing payment status:', err);
    next(err);
  }
};

// @desc    Fix payment statuses for all delivered orders
// @route   POST /api/orders/fix-payment-status
// @access  Private/Admin
exports.fixPaymentStatuses = async (req, res, next) => {
  try {
    console.log('Starting payment status fix for delivered orders');
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }
    
    // Find all orders marked as delivered but with payment status not completed
    const inconsistentOrders = await Order.find({
      orderStatus: 'delivered',
      paymentStatus: { $ne: 'completed' }
    });
    
    console.log(`Found ${inconsistentOrders.length} inconsistent orders to fix`);
    
    const results = {
      ordersFixed: 0,
      paymentsCreated: 0,
      paymentsUpdated: 0,
      errors: []
    };
    
    // Process each inconsistent order
    for (const order of inconsistentOrders) {
      try {
        // Update order payment status
        order.paymentStatus = 'completed';
        await order.save();
        results.ordersFixed++;
        
        // Find or create payment record
        let payment = await Payment.findOne({ order: order._id });
        
        if (!payment) {
          // Create new payment record
          payment = new Payment({
            order: order._id,
            user: order.userId,
            amount: order.totalAmount,
            method: order.paymentMethod || 'unknown',
            status: 'completed',
            transactionId: `fix_batch_${order._id}_${Date.now()}`,
            paidAt: Date.now()
          });
          await payment.save();
          results.paymentsCreated++;
        } else if (payment.status !== 'completed') {
          // Update existing payment
          payment.status = 'completed';
          payment.paidAt = payment.paidAt || Date.now();
          await payment.save();
          results.paymentsUpdated++;
        }
        
        console.log(`Fixed order ${order._id}`);
      } catch (err) {
        console.error(`Error fixing order ${order._id}:`, err);
        results.errors.push({
          orderId: order._id,
          error: err.message
        });
      }
    }
    
    return res.json({
      success: true,
      message: `Fixed ${results.ordersFixed} orders' payment statuses`,
      data: results
    });
  } catch (err) {
    console.error('Error fixing payment statuses:', err);
    next(err);
  }
}; 
