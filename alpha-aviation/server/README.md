# Alpha Aviation Server

Professional Node.js Express backend with MongoDB, JWT authentication, and payment logging.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server root with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/alpha-aviation
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
server/
├── models/
│   ├── User.js          # User model (Student/Admin roles)
│   └── Payment.js       # Payment model (linked to User)
├── controllers/
│   ├── authController.js    # Authentication logic (register, login, profile)
│   └── paymentController.js # Payment logging logic
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── paymentRoutes.js     # Payment routes
├── middleware/
│   ├── authMiddleware.js    # JWT authentication middleware
│   └── errorHandler.js      # Global error handling
├── server.js            # Main server entry point
└── package.json
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Payments (`/api/payments`)
- `POST /api/payments` - Create payment record (protected)
- `GET /api/payments` - Get all user payments (protected)
- `GET /api/payments/:id` - Get payment by ID (protected)
- `PATCH /api/payments/:id/status` - Update payment status (protected)

### Health Check
- `GET /api/health` - Server health check

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Models

### User
- `email` (String, unique, required)
- `password` (String, required, min 6 chars, hashed)
- `role` (String, enum: ['Student', 'Admin'], default: 'Student')
- `firstName` (String)
- `lastName` (String)
- `timestamps` (createdAt, updatedAt)

### Payment
- `user` (ObjectId, ref: User, required)
- `amount` (Number, required, min: 0)
- `status` (String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending')
- `description` (String)
- `paymentMethod` (String)
- `timestamps` (createdAt, updatedAt)
