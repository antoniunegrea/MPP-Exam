"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
class WebSocketService {
    constructor(server) {
        this.clients = new Set();
        this.generationInterval = null;
        this.characters = [];
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            // Send initial characters list to new client
            ws.send(JSON.stringify({
                type: 'INITIAL_CHARACTERS',
                characters: this.characters
            }));
            ws.on('message', (message) => {
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
            this.addCharacter(newCharacter);
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
    addCharacter(character) {
        const id = this.characters.length > 0 ? Math.max(...this.characters.map(char => char.id)) + 1 : 1;
        const newCharacter = Object.assign({ id }, character);
        this.characters.push(newCharacter);
        this.broadcast({
            type: 'NEW_CHARACTER',
            character: newCharacter
        });
        console.log("New character added:", newCharacter);
    }
    updateCharacter(id, character) {
        const index = this.characters.findIndex(char => char.id === id);
        if (index !== -1) {
            const updatedCharacter = Object.assign({ id }, character);
            this.characters[index] = updatedCharacter;
            this.broadcast({
                type: 'CHARACTER_UPDATED',
                character: updatedCharacter
            });
            console.log("Character updated:", updatedCharacter);
        }
    }
    deleteCharacter(id) {
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
