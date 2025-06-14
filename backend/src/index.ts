import express from 'express';
import cors from 'cors';
import { CharacterContext } from './context/CharacterContext';
import { GameContext } from './context/GameContext';
import { initializeIO } from './config/io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = initializeIO(httpServer);

// Create GameContext after initializing Socket.io
const gameContext = new GameContext(io);

const port = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    console.log('Request Headers:', req.headers);
    next();
});

// Initialize contexts
const characterContext = new CharacterContext();
console.log('Contexts initialized');

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Routes
app.get('/api/characters', async (req, res) => {
    try {
        const characters = await characterContext.getAllCharacters();
        res.json(characters);
    } catch (error) {
        console.error('Error in GET /api/characters:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/characters/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const character = await characterContext.getCharacterById(id);
        
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        
        res.json(character);
    } catch (error) {
        console.error('Error in GET /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/characters', async (req, res) => {
    try {
        const newCharacter = await characterContext.addCharacter(req.body);
        res.status(201).json(newCharacter);
    } catch (error) {
        console.error('Error in POST /api/characters:', error);
        res.status(400).json({ message: 'Invalid character data' });
    }
});

app.put('/api/characters/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedCharacter = await characterContext.updateCharacter(id, req.body);
        
        if (!updatedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }
        
        res.json(updatedCharacter);
    } catch (error) {
        console.error('Error in PUT /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/characters/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const success = await characterContext.deleteCharacter(id);
        
        if (!success) {
            return res.status(404).json({ message: 'Character not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/characters/generate', async (req, res) => {
    try {
        const count = req.body.count || 100;
        const newCharacters = await characterContext.generateRandomCharacters(count);
        res.status(201).json(newCharacters);
    } catch (error) {
        console.error('Error in POST /api/characters/generate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// New game endpoints
app.post('/api/game/join/:characterId', async (req, res) => {
    try {
        const characterId = parseInt(req.params.characterId);
        const position = await gameContext.joinGame(characterId);
        
        // Notify all clients about the new player
        io.emit('playerJoined', position);
        
        res.status(201).json(position);
    } catch (error) {
        console.error('Error in POST /api/game/join/:characterId:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/game/leave/:characterId', async (req, res) => {
    try {
        const characterId = parseInt(req.params.characterId);
        const success = await gameContext.leaveGame(characterId);
        
        if (success) {
            // Notify all clients about the player leaving
            io.emit('playerLeft', characterId);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Character not found in game' });
        }
    } catch (error) {
        console.error('Error in DELETE /api/game/leave/:characterId:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/game/positions', async (req, res) => {
    try {
        const positions = await gameContext.getAllPositions();
        res.json(positions);
    } catch (error) {
        console.error('Error in GET /api/game/positions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Move character endpoint
app.put('/api/game/move/:characterId', async (req, res) => {
    try {
        const characterId = parseInt(req.params.characterId);
        const position = req.body;
        
        if (!position.position_x || !position.position_y) {
            return res.status(400).json({ error: 'Position coordinates are required' });
        }

        const updatedPosition = await gameContext.moveCharacter(characterId, position);
        res.json(updatedPosition);
    } catch (error) {
        console.error('Error moving character:', error);
        res.status(500).json({ error: 'Failed to move character' });
    }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/characters`);
});
