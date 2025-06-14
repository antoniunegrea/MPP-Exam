import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { Character } from '../models/Character';

class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private generationInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'START_GENERATION') {
            this.startGeneration();
          } else if (data.type === 'STOP_GENERATION') {
            this.stopGeneration();
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
      this.broadcast({
        type: 'NEW_CHARACTER',
        character: newCharacter
      });
      console.log("New character generated:", newCharacter);
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