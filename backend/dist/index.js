"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const characterRoutes_1 = __importDefault(require("./routes/characterRoutes"));
const websocketService_1 = __importDefault(require("./services/websocketService"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/characters', characterRoutes_1.default);
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Initialize WebSocket service
const wss = new websocketService_1.default(server);
// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
