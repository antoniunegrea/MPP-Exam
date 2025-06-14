import { Character } from '../types/Character';

export class CharacterContext {
    private characters: Character[] = [];

    constructor() {
        // Initialize with some default characters
        this.characters = [
            {
                id: 1,
                name: "Kratos",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7YNUSx1VaJRtF7r_jWNMoZl6ZYgQfJ-7pTw&s",
                abilities: {
                    strength: 90,
                    agility: 70,
                    defense: 80
                }
            },
            {
                id: 2,
                name: "Lara Croft",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 70,
                    agility: 90,
                    defense: 60
                }
            },
            {
                id: 3,
                name: "Master Chief",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 85,
                    agility: 75,
                    defense: 90
                }
            },
            {
                id: 4,
                name: "Zelda",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 60,
                    agility: 80,
                    defense: 70
                }
            },
            {
                id: 5,
                name: "Geralt of Rivia",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 85,
                    agility: 85,
                    defense: 75
                }
            },
            {
                id: 6,
                name: "Samus Aran",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 75,
                    agility: 85,
                    defense: 85
                }
            },
            {
                id: 7,
                name: "Doom Slayer",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 95,
                    agility: 80,
                    defense: 85
                }
            },
            {
                id: 8,
                name: "Cloud Strife",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 80,
                    agility: 85,
                    defense: 70
                }
            },
            {
                id: 9,
                name: "Aloy",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 70,
                    agility: 90,
                    defense: 65
                }
            },
            {
                id: 10,
                name: "Mario",
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: 75,
                    agility: 95,
                    defense: 60
                }
            }
        ];
    }

    getAllCharacters(): Character[] {
        return this.characters;
    }

    getCharacterById(id: number): Character | undefined {
        return this.characters.find(char => char.id === id);
    }

    addCharacter(character: Omit<Character, 'id'>): Character {
        const newId = Math.max(...this.characters.map(c => c.id), 0) + 1;
        const newCharacter = { ...character, id: newId };
        this.characters.push(newCharacter);
        return newCharacter;
    }

    updateCharacter(id: number, character: Partial<Character>): Character | undefined {
        const index = this.characters.findIndex(char => char.id === id);
        if (index === -1) return undefined;

        this.characters[index] = { ...this.characters[index], ...character };
        return this.characters[index];
    }

    deleteCharacter(id: number): boolean {
        const initialLength = this.characters.length;
        this.characters = this.characters.filter(char => char.id !== id);
        return this.characters.length !== initialLength;
    }

    generateRandomCharacters(count: number): Character[] {
        const names = [
            "Aragorn", "Gandalf", "Legolas", "Gimli", "Frodo",
            "Samwise", "Merry", "Pippin", "Boromir", "Faramir",
            "Galadriel", "Elrond", "Arwen", "Eowyn", "Theoden"
        ];

        const newCharacters: Character[] = [];
        for (let i = 0; i < count; i++) {
            const randomName = names[Math.floor(Math.random() * names.length)];
            const newCharacter: Omit<Character, 'id'> = {
                name: randomName,
                image: "https://i.imgur.com/8Km9tLL.jpg",
                abilities: {
                    strength: Math.floor(Math.random() * 41) + 60, // 60-100
                    agility: Math.floor(Math.random() * 41) + 60,  // 60-100
                    defense: Math.floor(Math.random() * 41) + 60   // 60-100
                }
            };
            newCharacters.push(this.addCharacter(newCharacter));
        }
        return newCharacters;
    }
} 