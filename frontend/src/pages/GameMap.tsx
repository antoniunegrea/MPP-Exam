import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface GamePosition {
    id: number;
    character_id: number;
    position_x: number;
    position_y: number;
    created_at: string;
}

interface Character {
    id: number;
    name: string;
    image: string;
}

const MOVE_STEP = 5; // Percentage of map size to move per keypress

const GameMap: React.FC = () => {
    const { characterId } = useParams<{ characterId: string }>();
    const navigate = useNavigate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [positions, setPositions] = useState<GamePosition[]>([]);
    const [characters, setCharacters] = useState<{ [key: number]: Character }>({});
    const [hasJoined, setHasJoined] = useState(false);
    const isJoiningRef = useRef(false);
    const isMovingRef = useRef(false);

    const handleKeyPress = async (event: KeyboardEvent) => {
        if (!characterId || isMovingRef.current) return;

        const storedCharacterId = localStorage.getItem('currentGameCharacterId');
        if (!storedCharacterId) return;

        const currentPosition = positions.find(p => p.character_id === parseInt(storedCharacterId));
        if (!currentPosition) return;

        let newX = currentPosition.position_x;
        let newY = currentPosition.position_y;

        switch (event.key) {
            case 'ArrowUp':
                newY = Math.max(0, currentPosition.position_y - MOVE_STEP);
                break;
            case 'ArrowDown':
                newY = Math.min(100, currentPosition.position_y + MOVE_STEP);
                break;
            case 'ArrowLeft':
                newX = Math.max(0, currentPosition.position_x - MOVE_STEP);
                break;
            case 'ArrowRight':
                newX = Math.min(100, currentPosition.position_x + MOVE_STEP);
                break;
            default:
                return;
        }

        // Only update if position actually changed
        if (newX === currentPosition.position_x && newY === currentPosition.position_y) return;

        isMovingRef.current = true;
        try {
            console.log(`[GameMap] Moving character ${storedCharacterId} to (${newX}, ${newY})`);
            const response = await axios.put(`http://localhost:3001/api/game/move/${storedCharacterId}`, {
                position_x: newX,
                position_y: newY
            });
            console.log('[GameMap] Move response:', response.data);

            // Update local positions state
            setPositions(prev => prev.map(pos => 
                pos.character_id === parseInt(storedCharacterId)
                    ? { ...pos, position_x: newX, position_y: newY }
                    : pos
            ));
        } catch (error) {
            console.error('[GameMap] Error moving character:', error);
        } finally {
            isMovingRef.current = false;
        }
    };

    useEffect(() => {
        console.log(`[GameMap] Component mounted/updated with characterId: ${characterId}, hasJoined: ${hasJoined}`);
        
        // Save character ID to localStorage when component mounts
        if (characterId) {
            console.log(`[GameMap] Saving characterId ${characterId} to localStorage`);
            localStorage.setItem('currentGameCharacterId', characterId);
        }

        // Connect to WebSocket
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);
        console.log('[GameMap] WebSocket connected');

        // Join the game only once
        const joinGame = async () => {
            if (!hasJoined && characterId && !isJoiningRef.current) {
                console.log(`[GameMap] Attempting to join game for character ${characterId}`);
                isJoiningRef.current = true;
                try {
                    const joinResponse = await axios.post(`http://localhost:3001/api/game/join/${characterId}`);
                    console.log('[GameMap] Join game response:', joinResponse.data);
                    setHasJoined(true);
                    
                    // After joining, fetch all positions
                    const positionsResponse = await axios.get('http://localhost:3001/api/game/positions');
                    console.log('[GameMap] Fetched positions:', positionsResponse.data);
                    setPositions(positionsResponse.data);
                } catch (error) {
                    console.error('[GameMap] Error joining game:', error);
                } finally {
                    isJoiningRef.current = false;
                }
            } else {
                console.log(`[GameMap] Skipping join game - hasJoined: ${hasJoined}, characterId: ${characterId}, isJoining: ${isJoiningRef.current}`);
            }
        };

        joinGame();

        // Fetch character details for all positions
        const fetchCharacters = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/characters');
                const characterMap: { [key: number]: Character } = {};
                response.data.forEach((char: Character) => {
                    characterMap[char.id] = char;
                });
                setCharacters(characterMap);
                console.log('[GameMap] Fetched characters:', characterMap);
            } catch (error) {
                console.error('[GameMap] Error fetching characters:', error);
            }
        };

        fetchCharacters();

        // Listen for new players
        newSocket.on('playerJoined', (position: GamePosition) => {
            console.log('[GameMap] Received playerJoined event:', position);
            setPositions(prev => {
                // Check if position already exists
                const exists = prev.some(p => p.character_id === position.character_id);
                if (exists) {
                    // Update existing position
                    return prev.map(p => 
                        p.character_id === position.character_id ? position : p
                    );
                }
                // Add new position
                return [...prev, position];
            });
        });

        // Listen for position updates
        newSocket.on('positionUpdated', (position: GamePosition) => {
            console.log('[GameMap] Received positionUpdated event:', position);
            setPositions(prev => prev.map(p => 
                p.character_id === position.character_id ? position : p
            ));
        });

        // Listen for players leaving
        newSocket.on('playerLeft', (characterId: number) => {
            console.log(`[GameMap] Received playerLeft event for character ${characterId}`);
            setPositions(prev => prev.filter(pos => pos.character_id !== characterId));
        });

        // Add keyboard event listener
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup function
        return () => {
            console.log('[GameMap] Component unmounting, cleaning up...');
            newSocket.close();
            window.removeEventListener('keydown', handleKeyPress);
            // Remove character ID from localStorage when component unmounts
            localStorage.removeItem('currentGameCharacterId');
        };
    }, [characterId, hasJoined]);

    const handleLeaveGame = async () => {
        console.log('[GameMap] Handling leave game');
        try {
            const storedCharacterId = localStorage.getItem('currentGameCharacterId');
            if (storedCharacterId) {
                console.log(`[GameMap] Leaving game for character ${storedCharacterId}`);
                await axios.delete(`http://localhost:3001/api/game/leave/${storedCharacterId}`);
                localStorage.removeItem('currentGameCharacterId');
            }
            navigate('/');
        } catch (error) {
            console.error('[GameMap] Error leaving game:', error);
            // Even if the server request fails, navigate back to home
            localStorage.removeItem('currentGameCharacterId');
            navigate('/');
        }
    };

    return (
        <div className="game-map">
            <h1>Game Map</h1>
            <div className="map-container" style={{ position: 'relative', width: '800px', height: '600px', border: '1px solid black' }}>
                {positions.map((position) => {
                    const character = characters[position.character_id];
                    return character ? (
                        <div
                            key={`${position.character_id}-${position.id}`}
                            style={{
                                position: 'absolute',
                                left: `${position.position_x}%`,
                                top: `${position.position_y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '50px',
                                height: '50px',
                                backgroundImage: `url(${character.image})`,
                                backgroundSize: 'cover',
                                borderRadius: '50%',
                                border: '2px solid white',
                                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                            }}
                            title={character.name}
                        />
                    ) : null;
                })}
            </div>
            <div className="game-actions" style={{ marginTop: '20px' }}>
                <button 
                    onClick={handleLeaveGame}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Leave Game
                </button>
                <button 
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Character List
                </button>
            </div>
        </div>
    );
};

export default GameMap; 