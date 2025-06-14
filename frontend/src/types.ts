export interface GamePosition {
    id: number;
    character_id: number;
    position_x: number;
    position_y: number;
    created_at: string;
}

export interface Character {
    id: number;
    name: string;
    image: string;
    abilities: {
        strength: number;
        defense: number;
        speed: number;
    };
} 