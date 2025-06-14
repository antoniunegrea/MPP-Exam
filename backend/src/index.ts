import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import characterRoutes from './routes/characterRoutes';
import WebSocketService from './services/websocketService';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/characters', characterRoutes);

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
const wss = new WebSocketService(server);

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
