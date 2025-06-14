"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopGeneration = exports.startGeneration = exports.deleteCharacter = exports.updateCharacter = exports.createCharacter = exports.getCharacterById = exports.getAllCharacters = void 0;
const Character_1 = require("../models/Character");
// Get all characters
const getAllCharacters = (req, res) => {
    res.json(Character_1.characters);
};
exports.getAllCharacters = getAllCharacters;
// Get character by ID
const getCharacterById = (req, res) => {
    const id = parseInt(req.params.id);
    const character = Character_1.characters.find(char => char.id === id);
    if (!character) {
        return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
};
exports.getCharacterById = getCharacterById;
// Create new character
const createCharacter = (req, res) => {
    const newCharacter = req.body;
    const id = Character_1.characters.length > 0 ? Math.max(...Character_1.characters.map(char => char.id)) + 1 : 1;
    const character = Object.assign({ id }, newCharacter);
    Character_1.characters.push(character);
    res.status(201).json(character);
};
exports.createCharacter = createCharacter;
// Update character
const updateCharacter = (req, res) => {
    const id = parseInt(req.params.id);
    const characterIndex = Character_1.characters.findIndex(char => char.id === id);
    if (characterIndex === -1) {
        return res.status(404).json({ message: 'Character not found' });
    }
    const updatedCharacter = Object.assign({ id }, req.body);
    Character_1.characters[characterIndex] = updatedCharacter;
    res.json(updatedCharacter);
};
exports.updateCharacter = updateCharacter;
// Delete character
const deleteCharacter = (req, res) => {
    const id = parseInt(req.params.id);
    const characterIndex = Character_1.characters.findIndex(char => char.id === id);
    if (characterIndex === -1) {
        return res.status(404).json({ message: 'Character not found' });
    }
    Character_1.characters.splice(characterIndex, 1);
    res.status(204).send();
};
exports.deleteCharacter = deleteCharacter;
// Character generation thread
let generationInterval = null;
const generateRandomCharacter = () => {
    const names = ['Warrior', 'Mage', 'Archer', 'Knight', 'Rogue', 'Paladin', 'Wizard', 'Berserker', 'Monk', 'Druid'];
    const randomName = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 1000)}`;
    return {
        name: randomName,
        image: 'https://picsum.photos/200',
        abilities: {
            strength: Math.floor(Math.random() * 100),
            agility: Math.floor(Math.random() * 100),
            defense: Math.floor(Math.random() * 100)
        }
    };
};
// Start character generation
const startGeneration = (req, res) => {
    if (generationInterval) {
        return res.status(400).json({ message: 'Generation is already running' });
    }
    generationInterval = setInterval(() => {
        const newCharacter = generateRandomCharacter();
        const id = Character_1.characters.length > 0 ? Math.max(...Character_1.characters.map(char => char.id)) + 1 : 1;
        Character_1.characters.push(Object.assign({ id }, newCharacter));
    }, 1000);
    res.json({ message: 'Character generation started' });
};
exports.startGeneration = startGeneration;
// Stop character generation
const stopGeneration = (req, res) => {
    if (!generationInterval) {
        return res.status(400).json({ message: 'No generation is running' });
    }
    clearInterval(generationInterval);
    generationInterval = null;
    res.json({ message: 'Character generation stopped' });
};
exports.stopGeneration = stopGeneration;
