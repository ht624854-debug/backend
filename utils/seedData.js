const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');

// Connect to database
mongoose.connect(config.MONGODB_URI, {
  // Connection options if needed
})
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Clear existing data
      await User.deleteMany({});
      await Category.deleteMany({});
      await Product.deleteMany({});
      await Review.deleteMany({});
      
      console.log('Cleared existing data');

      // Create admin user
      const adminPassword = 'admin123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@gulzaar.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Admin user created:', admin.email);

      // Create regular user
      const userPassword = 'password123';
      const userSalt = await bcrypt.genSalt(10);
      const userHashedPassword = await bcrypt.hash(userPassword, userSalt);

      const user = await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: userHashedPassword,
        role: 'user'
      });

      console.log('Test user created:', user.email);

      // Create another regular user for review diversity
      const user2 = await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: userHashedPassword,
        role: 'user'
      });

      console.log('Second test user created:', user2.email);

      // Create categories
      const menCategory = await Category.create({
        name: 'Men',
        parent: null
      });

      const womenCategory = await Category.create({
        name: 'Women',
        parent: null
      });

      const kidsCategory = await Category.create({
        name: 'Kids',
        parent: null
      });

      // Create subcategories
      const menTshirts = await Category.create({
        name: 'T-Shirts',
        parent: menCategory._id
      });

      const menJeans = await Category.create({
        name: 'Jeans',
        parent: menCategory._id
      });

      const womenDresses = await Category.create({
        name: 'Dresses',
        parent: womenCategory._id
      });

      console.log('Categories created');

      // Create products
      const products = [
        {
          title: "Men's Basic Cotton T-Shirt",
          description: "Comfortable cotton t-shirt for everyday wear.",
          category: menTshirts._id,
          price: 19.99,
          stock: 50,
          isOnSale: true,
          discount: 10,
          images: ["https://example.com/tshirt1.jpg"],
          variants: [
            { size: 'S', color: 'Black', stock: 10 },
            { size: 'M', color: 'Black', stock: 15 },
            { size: 'L', color: 'Black', stock: 10 },
            { size: 'S', color: 'White', stock: 5 },
            { size: 'M', color: 'White', stock: 5 },
            { size: 'L', color: 'White', stock: 5 }
          ],
          tags: ['cotton', 'basic', 'casual'],
          rating: 4.5,
          numReviews: 2
        },
        {
          title: "Men's Slim Fit Jeans",
          description: "Stylish slim fit jeans for a modern look.",
          category: menJeans._id,
          price: 39.99,
          stock: 30,
          isOnSale: false,
          images: ["https://example.com/jeans1.jpg"],
          variants: [
            { size: '30', color: 'Blue', stock: 8 },
            { size: '32', color: 'Blue', stock: 8 },
            { size: '34', color: 'Blue', stock: 8 },
            { size: '36', color: 'Blue', stock: 6 }
          ],
          tags: ['jeans', 'slim fit', 'denim'],
          rating: 5.0,
          numReviews: 1
        },
        {
          title: "Women's Summer Dress",
          description: "Light and flowy summer dress perfect for hot days.",
          category: womenDresses._id,
          price: 49.99,
          stock: 25,
          isOnSale: true,
          discount: 15,
          images: ["https://example.com/dress1.jpg"],
          variants: [
            { size: 'XS', color: 'Floral', stock: 5 },
            { size: 'S', color: 'Floral', stock: 8 },
            { size: 'M', color: 'Floral', stock: 7 },
            { size: 'L', color: 'Floral', stock: 5 }
          ],
          tags: ['dress', 'summer', 'floral'],
          rating: 4.0,
          numReviews: 3
        }
      ];

      const createdProducts = await Product.insertMany(products);
      console.log('Products created');

      // Create sample reviews
      const reviews = [
        // Reviews for the T-shirt
        {
          userId: user._id,
          productId: createdProducts[0]._id,
          rating: 5,
          comment: "This t-shirt is amazing! The cotton is very soft and comfortable to wear all day. Highly recommend it.",
          createdAt: new Date()
        },
        {
          userId: user2._id,
          productId: createdProducts[0]._id,
          rating: 4,
          comment: "Good quality t-shirt, but it runs a bit small. Order a size up if you're in doubt.",
          createdAt: new Date()
        },
        
        // Review for the jeans
        {
          userId: user._id,
          productId: createdProducts[1]._id,
          rating: 5,
          comment: "Perfect fit and the quality is excellent. These jeans are now my favorite pair!",
          createdAt: new Date()
        },
        
        // Reviews for the dress
        {
          userId: user._id,
          productId: createdProducts[2]._id,
          rating: 4,
          comment: "Beautiful summer dress, just as pictured. The material is light and perfect for hot days.",
          createdAt: new Date()
        },
        {
          userId: user2._id,
          productId: createdProducts[2]._id,
          rating: 5,
          comment: "Love this dress! The floral pattern is gorgeous and the fit is very flattering.",
          createdAt: new Date()
        },
        {
          userId: admin._id,
          productId: createdProducts[2]._id,
          rating: 3,
          comment: "Nice dress but the zipper could be better quality. Otherwise happy with the purchase.",
          createdAt: new Date()
        }
      ];

      await Review.insertMany(reviews);
      console.log('Reviews created');

      console.log('Database seeded successfully!');
      process.exit(0);
    } catch (err) {
      console.error('Error seeding database:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 
