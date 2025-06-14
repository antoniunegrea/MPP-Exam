"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const CharacterContext_1 = require("./context/CharacterContext");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});
// Initialize character context
const characterContext = new CharacterContext_1.CharacterContext();
console.log('CharacterContext initialized with', characterContext.getAllCharacters().length, 'characters');
// Routes
app.get('/api/characters', (req, res) => {
    console.log('Fetching all characters...');
    const characters = characterContext.getAllCharacters();
    console.log(`Found ${characters.length} characters`);
    res.json(characters);
});
app.get('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Fetching character with ID: ${id}`);
    const character = characterContext.getCharacterById(id);
    if (!character) {
        console.log(`Character with ID ${id} not found`);
        return res.status(404).json({ message: 'Character not found' });
    }
    console.log('Found character:', character);
    res.json(character);
});
app.post('/api/characters', (req, res) => {
    console.log('Creating new character:', req.body);
    try {
        const newCharacter = characterContext.addCharacter(req.body);
        console.log('Successfully created character:', newCharacter);
        res.status(201).json(newCharacter);
    }
    catch (error) {
        console.error('Error creating character:', error);
        res.status(400).json({ message: 'Invalid character data' });
    }
});
app.put('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Updating character with ID: ${id}`, req.body);
    const updatedCharacter = characterContext.updateCharacter(id, req.body);
    if (!updatedCharacter) {
        console.log(`Character with ID ${id} not found for update`);
        return res.status(404).json({ message: 'Character not found' });
    }
    console.log('Successfully updated character:', updatedCharacter);
    res.json(updatedCharacter);
});
app.delete('/api/characters/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`Attempting to delete character with ID: ${id}`);
    const success = characterContext.deleteCharacter(id);
    if (!success) {
        console.log(`Character with ID ${id} not found for deletion`);
        return res.status(404).json({ message: 'Character not found' });
    }
    console.log(`Successfully deleted character with ID: ${id}`);
    res.status(204).send();
});
app.post('/api/characters/generate', (req, res) => {
    const count = req.body.count || 100;
    console.log(`Generating ${count} random characters`);
    const newCharacters = characterContext.generateRandomCharacters(count);
    console.log(`Successfully generated ${newCharacters.length} characters`);
    res.status(201).json(newCharacters);
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/characters`);
});
