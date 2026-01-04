const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('parent', 'name');
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    // If parent category ID is provided
    if (req.body.parent) {
      // Validate parent category existence
      if (!mongoose.Types.ObjectId.isValid(req.body.parent)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID format'
        });
      }
      
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }
    
    const category = await Category.create(req.body);
    
    // Populate parent information for response
    const populatedCategory = await Category.findById(category._id).populate('parent', 'name');
    
    res.status(201).json({
      success: true,
      data: populatedCategory
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // If parent category ID is changing
    if (req.body.parent) {
      // Validate parent category existence
      if (!mongoose.Types.ObjectId.isValid(req.body.parent)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID format'
        });
      }
      
      // Check if parent exists
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      
      // Prevent circular references (category can't be its own parent)
      if (req.body.parent === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('parent', 'name');

    res.json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has children
    const childCategories = await Category.find({ parent: req.params.id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with child categories'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 
