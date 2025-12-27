const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const { category, isOnSale, minPrice, maxPrice, sort } = req.query;
    let query = {};

    // Filter by category - handle both direct categories and parent-child relationships
    if (category) {
      try {
        // Find all subcategories of the given category
        const subcategories = await Category.find({ parent: category });
        const subcategoryIds = subcategories.map(cat => cat._id);
        
        // Include both the main category and its subcategories in the query
        query.category = { $in: [category, ...subcategoryIds] };
        
        console.log(`Filtering by category: ${category}, including subcategories: ${subcategoryIds}`);
      } catch (err) {
        console.error('Error processing category filter:', err);
        query.category = category; // Fallback to simple matching
      }
    }

    // Filter by sale status
    if (isOnSale) {
      query.isOnSale = isOnSale === 'true';
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    let sortObj = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        const [key, value] = field.split(':');
        sortObj[key] = value === 'desc' ? -1 : 1;
      });
    } else {
      sortObj = { createdAt: -1 };
    }

    // Find products and populate the category with its name and _id
    const products = await Product.find(query)
      .sort(sortObj)
      .populate({
        path: 'category',
        select: 'name _id parent',
        populate: { path: 'parent', select: 'name _id' }
      });

    // Log the query and results for debugging
    console.log(`Query: ${JSON.stringify(query)}, Found ${products.length} products`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'category',
        select: 'name _id parent',
        populate: { path: 'parent', select: 'name _id' }
      })
      .populate({
        path: 'reviews',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 