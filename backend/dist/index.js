"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
console.log('CharacterContext initialized');
// Routes
app.get('/api/characters', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const characters = yield characterContext.getAllCharacters();
        res.json(characters);
    }
    catch (error) {
        console.error('Error in GET /api/characters:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.get('/api/characters/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const character = yield characterContext.getCharacterById(id);
        if (!character) {
            return res.status(404).json({ message: 'Character not found' });
        }
        res.json(character);
    }
    catch (error) {
        console.error('Error in GET /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.post('/api/characters', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCharacter = yield characterContext.addCharacter(req.body);
        res.status(201).json(newCharacter);
    }
    catch (error) {
        console.error('Error in POST /api/characters:', error);
        res.status(400).json({ message: 'Invalid character data' });
    }
}));
app.put('/api/characters/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const updatedCharacter = yield characterContext.updateCharacter(id, req.body);
        if (!updatedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }
        res.json(updatedCharacter);
    }
    catch (error) {
        console.error('Error in PUT /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.delete('/api/characters/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const success = yield characterContext.deleteCharacter(id);
        if (!success) {
            return res.status(404).json({ message: 'Character not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Error in DELETE /api/characters/:id:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.post('/api/characters/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = req.body.count || 100;
        const newCharacters = yield characterContext.generateRandomCharacters(count);
        res.status(201).json(newCharacters);
    }
    catch (error) {
        console.error('Error in POST /api/characters/generate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
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
