"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
class WebSocketService {
    constructor(server) {
        this.clients = new Set();
        this.generationInterval = null;
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    if (data.type === 'START_GENERATION') {
                        this.startGeneration();
                    }
                    else if (data.type === 'STOP_GENERATION') {
                        this.stopGeneration();
                    }
                }
                catch (error) {
                    console.error('Error processing message:', error);
                }
            });
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }
    generateRandomCharacter() {
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
    startGeneration() {
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
    stopGeneration() {
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
            this.generationInterval = null;
            this.broadcast({ type: 'GENERATION_STOPPED' });
        }
    }
    broadcast(message) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }
}
exports.default = WebSocketService;
