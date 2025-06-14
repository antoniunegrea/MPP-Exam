export type Character = {
  id: number;
  name: string;
  image: string;
  abilities: {
    strength: number;
    agility: number;
    defense: number;
  };
};

export const characters: Character[] = [
  {
    id: 1,
    name: "Kratos",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7YNUSx1VaJRtF7r_jWNMoZl6ZYgQfJ-7pTw&s",
    abilities: {
      strength: 95.5,
      agility: 85.2,
      defense: 78.9
    }
  },
  {
    id: 2,
    name: "Lara Croft",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaTWR0PPONssyV4e8Ndta6jiVXQezb0-sQww&s",
    abilities: {
      strength: 75.8,
      agility: 92.4,
      defense: 88.7
    }
  },
  {
    id: 3,
    name: "Master Chief",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgHoxK2hR9T5a8CyuVCkjjHsbN4FEjTNEDVg&s",
    abilities: {
      strength: 90.1,
      agility: 82.3,
      defense: 85.6
    }
  },
  {
    id: 4,
    name: "Zelda",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFVyLEnEmGRG2z3axyrPWs305KW-4yzuLJzw&s",
    abilities: {
      strength: 65.4,
      agility: 88.9,
      defense: 94.2
    }
  },
  {
    id: 5,
    name: "Geralt of Rivia",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiGVvdNvLzb0vq7OV5BTxLhnGMKPLE4c7ZGQ&s",
    abilities: {
      strength: 88.7,
      agility: 86.5,
      defense: 91.3
    }
  },
  {
    id: 6,
    name: "Samus Aran",
    image: "https://upload.wikimedia.org/wikipedia/en/d/d6/Samus_Aran.png",
    abilities: {
      strength: 82.4,
      agility: 89.7,
      defense: 87.2
    }
  },
  {
    id: 7,
    name: "Doom Slayer",
    image: "https://media.gamestop.com/i/gamestop/20019554_ALT01?$pdp$",
    abilities: {
      strength: 96.8,
      agility: 84.3,
      defense: 76.5
    }
  },
  {
    id: 8,
    name: "Cloud Strife",
    image: "https://upload.wikimedia.org/wikipedia/en/9/9e/Cloud_Strife.png",
    abilities: {
      strength: 87.6,
      agility: 83.9,
      defense: 79.4
    }
  },
  {
    id: 9,
    name: "Aloy",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoVxQw1kE0dQOclUZRQoIgyYrErqqLxoPXXA&s",
    abilities: {
      strength: 78.3,
      agility: 91.5,
      defense: 89.8
    }
  },
  {
    id: 10,
    name: "Mario",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB9zZVgbow8_BpgJpmavj1qYHiRs2okDU72A&s",
    abilities: {
      strength: 85.2,
      agility: 93.7,
      defense: 72.4
    }
  }
]; 