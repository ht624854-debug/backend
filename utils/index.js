// Format validation error messages
exports.formatValidationErrors = (errors) => {
  const formattedErrors = {};
  errors.array().forEach((error) => {
    formattedErrors[error.param] = error.msg;
  });
  return formattedErrors;
};

// Calculate discounted price
exports.calculateDiscountedPrice = (price, discount) => {
  if (!discount) return price;
  return price - (price * (discount / 100));
};

// Generate random string for transaction IDs, etc.
exports.generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date
exports.formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Paginate results
exports.paginate = (page, limit) => {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 10;
  const skip = (p - 1) * l;

  return {
    skip,
    limit: l
  };
}; 
