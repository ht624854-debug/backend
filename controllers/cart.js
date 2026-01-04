const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    console.log('Get cart request for user:', req.user.id);
    
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('product', 'title price images stock');
    
    console.log('Found cart items:', cartItems.length);

    res.json({
      success: true,
      count: cartItems.length,
      data: cartItems
    });
  } catch (err) {
    console.error('Error in getCart:', err);
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    console.log('Add to cart request received:', req.body);
    console.log('User ID:', req.user.id);
    
    const { productId, quantity, variant } = req.body;
    
    if (!productId || !quantity || !variant) {
      console.error('Missing required fields:', { productId, quantity, variant });
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, quantity, and variant (size and color)'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('Product found:', product.title);

    // Find the specific variant and check its stock
    const selectedVariant = product.variants.find(
      v => v.size === variant.size && v.color === variant.color
    );

    if (!selectedVariant) {
      console.error('Variant not found:', variant);
      return res.status(404).json({
        success: false,
        message: 'Selected variant not found'
      });
    }

    // Check if selected variant has enough stock
    if (selectedVariant.stock < quantity) {
      console.error('Not enough variant stock:', { 
        requested: quantity, 
        available: selectedVariant.stock,
        variant: variant
      });
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available for the selected variant'
      });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      user: req.user.id,
      product: productId,
      'variant.size': variant.size,
      'variant.color': variant.color
    });
    
    console.log('Existing cart item found:', cartItem ? true : false);

    if (cartItem) {
      // Update quantity if item exists
      cartItem.quantity += quantity;
      await cartItem.save();
      console.log('Updated cart item quantity:', cartItem.quantity);
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        user: req.user.id,
        product: productId,
        quantity,
        variant
      });
      console.log('Created new cart item:', cartItem._id);
    }

    // Decrease variant stock
    selectedVariant.stock -= quantity;
    await product.save();
    console.log('Updated variant stock:', selectedVariant.stock);

    // Get all cart items to return to client
    const allCartItems = await CartItem.find({ user: req.user.id })
      .populate('product', 'title price images');
    
    console.log('Returning cart with items count:', allCartItems.length);

    res.status(201).json({
      success: true,
      data: {
        cartItem,
        items: allCartItems
      }
    });
  } catch (err) {
    console.error('Error in addToCart:', err);
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Make sure user owns cart item
    if (cartItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this cart item'
      });
    }

    // Increase product stock
    const product = await Product.findById(cartItem.product);
    if (product) {
      const variant = product.variants.find(
        v => v.size === cartItem.variant.size && v.color === cartItem.variant.color
      );
      
      if (variant) {
        variant.stock += cartItem.quantity;
        await product.save();
      }
    }

    await CartItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Make sure user owns cart item
    if (cartItem.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this cart item'
      });
    }

    const product = await Product.findById(cartItem.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find the specific variant
    const variant = product.variants.find(
      v => v.size === cartItem.variant.size && v.color === cartItem.variant.color
    );
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found'
      });
    }

    // Calculate stock difference
    const stockDifference = quantity - cartItem.quantity;

    // Check if enough stock available for the variant
    if (variant.stock < stockDifference) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available for the selected variant'
      });
    }

    // Update variant stock
    variant.stock -= stockDifference;
    await product.save();

    // Update cart item
    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      data: cartItem
    });
  } catch (err) {
    next(err);
  }
}; 
