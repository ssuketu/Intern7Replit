// This file serves as an entry point for Vercel serverless functions
// It will proxy requests to your Express server

// Import your Express app
import '../dist/index.js';

// This is a simple placeholder as the actual Express app is imported above
export default function handler(req, res) {
  res.status(200).json({
    message: 'API route working - your Express server should be handling all /api routes'
  });
}