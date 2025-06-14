import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { Character } from '../models/Character';

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private generationInterval: NodeJS.Timeout | null = null;
  private characters: Character[] = [];

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      // Send initial characters list to new client
      ws.send(JSON.stringify({
        type: 'INITIAL_CHARACTERS',
        characters: this.characters
      }));

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          
          switch (data.type) {
            case 'START_GENERATION':
              this.startGeneration();
              break;
            case 'STOP_GENERATION':
              this.stopGeneration();
              break;
            case 'ADD_CHARACTER':
              this.addCharacter(data.character);
              break;
            case 'UPDATE_CHARACTER':
              this.updateCharacter(data.id, data.character);
              break;
            case 'DELETE_CHARACTER':
              this.deleteCharacter(data.id);
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  private generateRandomCharacter(): Omit<Character, 'id'> {
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
  }

  private startGeneration() {
    if (this.generationInterval) {
      return;
    }

    this.generationInterval = setInterval(() => {
      const newCharacter = this.generateRandomCharacter();
      this.addCharacter(newCharacter);
    }, 1000);

    this.broadcast({ type: 'GENERATION_STARTED' });
  }

  private stopGeneration() {
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
      this.generationInterval = null;
      this.broadcast({ type: 'GENERATION_STOPPED' });
    }
  }

  private addCharacter(character: Omit<Character, 'id'>) {
    const id = this.characters.length > 0 ? Math.max(...this.characters.map(char => char.id)) + 1 : 1;
    const newCharacter = { id, ...character };
    this.characters.push(newCharacter);
    this.broadcast({
      type: 'NEW_CHARACTER',
      character: newCharacter
    });
    console.log("New character added:", newCharacter);
  }

  private updateCharacter(id: number, character: Omit<Character, 'id'>) {
    const index = this.characters.findIndex(char => char.id === id);
    if (index !== -1) {
      const updatedCharacter = { id, ...character };
      this.characters[index] = updatedCharacter;
      this.broadcast({
        type: 'CHARACTER_UPDATED',
        character: updatedCharacter
      });
      console.log("Character updated:", updatedCharacter);
    }
  }

  private deleteCharacter(id: number) {
    const index = this.characters.findIndex(char => char.id === id);
    if (index !== -1) {
      this.characters.splice(index, 1);
      this.broadcast({
        type: 'CHARACTER_DELETED',
        id
      });
      console.log("Character deleted:", id);
    }
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

export default WebSocketService; 