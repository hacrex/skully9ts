# Skully9Ts - Skull-Themed Apparel Store

A modern e-commerce platform specializing in skull-themed t-shirts, hoodies, jeans, and accessories.

## Features

- Modern and responsive design
- Product customization
- Secure payment processing
- Automated dropshipping integration
- User authentication and profiles
- Admin dashboard
- Real-time order tracking
- Blog section
- Newsletter subscription
- Social media integration

## Tech Stack

- Frontend: React.js, Material-UI, Redux
- Backend: Node.js, Express.js
- Database: MongoDB
- Payment: Stripe
- Authentication: JWT
- Email: Nodemailer
- Image Storage: Cloudinary
- Hosting: AWS/Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```
3. Create a .env file with necessary environment variables
4. Run the development server:
   ```bash
   npm run dev:full
   ```

## Environment Variables

Create a .env file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
CLOUDINARY_URL=your_cloudinary_url
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
