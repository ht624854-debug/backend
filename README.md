# Gulzaar Clothing Brand E-Commerce Backend

A fully-functional backend for the Gulzaar Clothing Brand e-commerce website that integrates with the React frontend. The backend handles user authentication, product management, cart management, orders, payments, and is optimized for scalability and performance with MongoDB.

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB (with Mongoose ORM)
- **Authentication**: JWT for user authentication (Admin and User roles)
- **Deployment**: Local (can be deployed to platforms like Render/Heroku)

## Setup Instructions

1. **Clone the repository**

```
git clone https://github.com/yourusername/gulzaar.git
cd gulzaar-backend
```

2. **Install dependencies**

```
npm install
```

3. **Create a .env file in the root directory with the following variables**

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gulzaar
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

4. **Start the development server**

```
npm run dev
```

5. **Seed the database with initial data (optional)**

```
npm run seed
```

6. **Create database indexes (optional, but recommended for performance)**

```
npm run create-indexes
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login a user and return a JWT token
- `GET /api/auth/profile`: View user profile (authenticated users only)

### Product Routes

- `GET /api/products`: Get all products (with optional filters for category, sale, price range)
- `POST /api/products`: Add a new product (admin only)
- `PUT /api/products/:id`: Update an existing product (admin only)
- `DELETE /api/products/:id`: Delete a product (admin only)

### Category Routes

- `GET /api/categories`: Get all categories
- `POST /api/categories`: Create a new category (admin only)
- `PUT /api/categories/:id`: Update a category (admin only)
- `DELETE /api/categories/:id`: Delete a category (admin only)

### Cart Routes

- `GET /api/cart`: Get user's cart
- `POST /api/cart`: Add an item to the cart
- `PUT /api/cart/:id`: Update an item in the cart
- `DELETE /api/cart/:id`: Remove an item from the cart

### Order Routes

- `GET /api/orders`: Get user's orders
- `POST /api/orders`: Place an order
- `GET /api/orders/:id`: Get a specific order
- `DELETE /api/orders/:id`: Cancel an order

### Payment Routes

- `POST /api/payments`: Record payment information (orderId, transactionId, status)
- `GET /api/payments`: Get user's payments
- `GET /api/payments/:orderId`: Get payment details for an order

### Review Routes

- `POST /api/reviews`: Add a review for a product
- `GET /api/reviews/:productId`: Get all reviews for a product
- `GET /api/reviews/user/me`: Get all reviews by the authenticated user

## Models

- **User**: For user authentication and profile management
- **Product**: For storing product details (title, description, price, stock, etc.)
- **Category**: For product categorization (Men, Women, Kids, etc.)
- **CartItem**: For storing items in user's cart
- **Order**: For order management
- **Payment**: For payment records
- **Review**: For product reviews and ratings

## Features

- User and Admin authentication with JWT
- Role-based access control
- Product management with stock control
- Cart management with stock adjustment
- Order processing and management
- Payment processing
- Review system
- Database indexing for performance optimization

## Default Users (after running seed script)

- **Admin User**
  - Email: admin@gulzaar.com
  - Password: admin123

- **Regular User**
  - Email: user@example.com
  - Password: password123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 