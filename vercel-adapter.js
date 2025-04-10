// This file adapts the server to work with Vercel's serverless environment
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main Express app
import './server/index.js';

// Setup static file serving for the client
const app = express();
app.use(express.static(join(__dirname, 'dist')));

// Catch-all handler for client routes (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  }
});

// Create HTTP server
const server = createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Vercel adapter server listening on port ${PORT}`);
});

// For Vercel serverless functions
export default app;