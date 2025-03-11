# Invasa - Print on Demand Application

This is a print-on-demand application that allows users to upload designs, customize them, and place orders for printed products.

## Features

- Product selection and customization
- Design upload and positioning
- Print area calculation
- Order management
- Payment integration with Razorpay

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server and the image upload server:
   ```
   npm run dev
   ```
   This will start both the React application on port 3000 and the image upload server on port 3001.

## Image Upload Server

The application includes a server for handling image uploads. The server:

1. Accepts image uploads via POST requests to `/upload`
2. Stores images in the `uploads` directory
3. Returns a URL that can be used to access the uploaded image

### Running the Server Separately

If you want to run the server separately:

```
npm run server
```

The server will run on port 3001 by default. You can change this by setting the `PORT` environment variable.

## Development

- React application: http://localhost:3000
- Image upload server: http://localhost:3001

## Order Process

1. Select a product
2. Choose size, color, and quantity
3. Upload and position designs
4. Review order details
5. Make payment
6. Order is saved to the database

## Print Design

The print design tool allows users to:

1. Upload images for different sides of the product (front, back, left sleeve, right sleeve)
2. Position and resize designs
3. See real-time calculations of print area and pricing

## Payment

Payment is handled through Razorpay. The application:

1. Calculates the total amount based on product price and print area
2. Creates a payment order
3. Processes the payment
4. Saves the order details to the database

## Troubleshooting

- If image uploads are not working, make sure the server is running on port 3001
- Check the console for any error messages
- Ensure that the `uploads` directory exists and is writable

## License

This project is licensed under the MIT License - see the LICENSE file for details.
