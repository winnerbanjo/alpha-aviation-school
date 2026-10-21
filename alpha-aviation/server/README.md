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
MODE=development
PORT=5000
RESEND_API_KEY=re_...
ZOHO_USER=support@aslaviationschool.co
ZOHO_PASS=your-zoho-password
CLIENT_URL=https://www.aslaviationschool.co
CERTIFICATE_SIGNING_SECRET=a-long-random-secret-used-only-for-certificates
```

`CLIENT_URL` is the public site address; certificate QR codes and emails link to `${CLIENT_URL}/verify/<code>`, so it must be the production domain in production.
`CERTIFICATE_SIGNING_SECRET` signs every issued certificate so edits made outside the app are detected. Set it once and never rotate it without re-signing existing certificates; if it is missing the server falls back to `JWT_SECRET` (and logs a warning), which would tie certificate validity to that secret.

`RESEND_API_KEY` is the preferred mail transport. `ZOHO_USER` and `ZOHO_PASS` stay in place as a fallback and for the sender identity.
Set `MODE=development` if you want student registration to go through the email OTP flow. Set `MODE=production` if you want direct enrollment without the enrollment OTP step. If `MODE` is omitted, the server defaults to `production`.

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

## Certificates

Admins issue verifiable certificates from **Admin → Certificates**. Each certificate gets:

- a registry number (`ASL-CRT-YYYY-NNNNN`, sequential per year, allocated atomically),
- a 12-character verification code (Crockford base32, 60 bits) encoded in the QR code,
- an HMAC-SHA256 signature over the printed fields (see `CERTIFICATE_SIGNING_SECRET`),
- an audit trail (issued, emailed, downloaded, revoked, reinstated, replaced).

The certificate artwork and PDF/PNG files are rendered in the browser from the stored record, so the server stores data only.

### Admin endpoints (`/api/admin/certificates`, admin JWT required)
- `GET /` — registry list (`search`, `status`, `type`, `programme`, `from`, `to`, `sort`, `page`, `limit`)
- `GET /stats` — totals, verification/download counts, six-month issuance series
- `GET /export` — CSV of the filtered registry
- `POST /` — issue one certificate. Send an `Idempotency-Key` header; returns `409 DUPLICATE` when the recipient already holds an active certificate of the same type for one of the programmes (resend with `confirmDuplicate: true` to override)
- `POST /bulk` — issue up to 250 rows; invalid rows and existing holders are skipped and reported per row
- `GET /:id` — full record with audit trail
- `POST /:id/revoke`, `POST /:id/reinstate` — require a `reason`
- `POST /:id/reissue` — corrected replacement; the original is marked superseded and its QR points to the replacement
- `POST /:id/send` — (re)send the certificate email, optionally correcting the address
- `POST /:id/events` — record a download (`{ type: "downloaded", format: "pdf" | "png" }`)

### Public endpoints (`/api/certificates`, rate limited)
- `GET /verify/:code` — `valid`, `revoked`, `superseded`, `integrity_failed` or 404 `not_found`. Never returns email, student link or revocation reason
- `POST /lookup` — `{ serial, surname }`; responds identically for an unknown ID and a wrong surname

### Student endpoint
- `GET /api/student/certificates` — the signed-in student's active and revoked certificates
