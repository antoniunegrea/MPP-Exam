import { Request, Response } from 'express';
import { Character, characters } from '../models/Character';

// Get all characters
export const getAllCharacters = (req: Request, res: Response) => {
  res.json(characters);
};

// Get character by ID
export const getCharacterById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const character = characters.find(char => char.id === id);
  
  if (!character) {
    return res.status(404).json({ message: 'Character not found' });
  }
  
  res.json(character);
};

// Create new character
export const createCharacter = (req: Request, res: Response) => {
  const newCharacter: Omit<Character, 'id'> = req.body;
  const id = characters.length > 0 ? Math.max(...characters.map(char => char.id)) + 1 : 1;
  
  const character: Character = {
    id,
    ...newCharacter
  };
  
  characters.push(character);
  res.status(201).json(character);
};

// Update character
export const updateCharacter = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const characterIndex = characters.findIndex(char => char.id === id);
  
  if (characterIndex === -1) {
    return res.status(404).json({ message: 'Character not found' });
  }
  
  const updatedCharacter: Character = {
    id,
    ...req.body
  };
  
  characters[characterIndex] = updatedCharacter;
  res.json(updatedCharacter);
};

// Delete character
export const deleteCharacter = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const characterIndex = characters.findIndex(char => char.id === id);
  
  if (characterIndex === -1) {
    return res.status(404).json({ message: 'Character not found' });
  }
  
  characters.splice(characterIndex, 1);
  res.status(204).send();
};

// Character generation thread
let generationInterval: NodeJS.Timeout | null = null;

const generateRandomCharacter = (): Omit<Character, 'id'> => {
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
export const startGeneration = (req: Request, res: Response) => {
  if (generationInterval) {
    return res.status(400).json({ message: 'Generation is already running' });
  }

  generationInterval = setInterval(() => {
    const newCharacter = generateRandomCharacter();
    const id = characters.length > 0 ? Math.max(...characters.map(char => char.id)) + 1 : 1;
    characters.push({ id, ...newCharacter });
  }, 1000);

  res.json({ message: 'Character generation started' });
};

// Stop character generation
export const stopGeneration = (req: Request, res: Response) => {
  if (!generationInterval) {
    return res.status(400).json({ message: 'No generation is running' });
  }

  clearInterval(generationInterval);
  generationInterval = null;
  res.json({ message: 'Character generation stopped' });
}; 