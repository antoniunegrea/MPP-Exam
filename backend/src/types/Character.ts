export interface Character {
    id: number;
    name: string;
    image: string;
    abilities: {
        strength: number;
        agility: number;
        defense: number;
    };
} 