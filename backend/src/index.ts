import express from 'express';
import cors from 'cors';
import { CharacterContext } from './context/CharacterContext';

const app = express();
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

// Initialize character context
const characterContext = new CharacterContext();
console.log('CharacterContext initialized');

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

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/characters`);
});
