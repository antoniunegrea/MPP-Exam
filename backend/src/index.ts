import express from 'express';
import cors from 'cors';
import { CharacterContext } from './context/CharacterContext';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize character context
const characterContext = new CharacterContext();

// Routes
app.get('/api/characters', (req, res) => {
    const characters = characterContext.getAllCharacters();
    res.json(characters);
});

app.get('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const character = characterContext.getCharacterById(id);
    
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json(character);
});

app.post('/api/characters', (req, res) => {
    try {
        const newCharacter = characterContext.addCharacter(req.body);
        res.status(201).json(newCharacter);
    } catch (error) {
        res.status(400).json({ message: 'Invalid character data' });
    }
});

app.put('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedCharacter = characterContext.updateCharacter(id, req.body);
    
    if (!updatedCharacter) {
        return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json(updatedCharacter);
});

app.delete('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const success = characterContext.deleteCharacter(id);
    
    if (!success) {
        return res.status(404).json({ message: 'Character not found' });
    }
    
    res.status(204).send();
});

app.post('/api/characters/generate', (req, res) => {
    const count = req.body.count || 100;
    const newCharacters = characterContext.generateRandomCharacters(count);
    res.status(201).json(newCharacters);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
