import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { socket } from '../services/socket';
import { GamePosition, Character } from '../types';
import { CHARACTER_RADIUS, PROXIMITY_RADIUS } from '../constants';

interface PlayerHealth {
    characterId: number;
    health: number;
    maxHealth: number;
}

const MOVE_STEP = 5; // Percentage of map size to move per keypress

const GameMap: React.FC = () => {
    const { characterId } = useParams<{ characterId: string }>();
    const navigate = useNavigate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [positions, setPositions] = useState<GamePosition[]>([]);
    const [characters, setCharacters] = useState<Record<number, Character>>({});
    const [hasJoined, setHasJoined] = useState(false);
    const isJoiningRef = useRef(false);
    const isMovingRef = useRef(false);
    const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentPositionRef = useRef<GamePosition | null>(null);
    const [nearbyCharacters, setNearbyCharacters] = useState<number[]>([]);
    const [playerHealth, setPlayerHealth] = useState<Record<number, PlayerHealth>>({});
    const [isFighting, setIsFighting] = useState(false);
    const fightIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate distance between two positions
    const calculateDistance = (pos1: GamePosition, pos2: GamePosition): number => {
        const dx = pos1.position_x - pos2.position_x;
        const dy = pos1.position_y - pos2.position_y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Check for nearby characters
    const checkProximity = (currentPosition: GamePosition) => {
        const currentCharacterId = parseInt(localStorage.getItem('currentGameCharacterId') || '0');
        const nearby: number[] = [];

        positions.forEach((position) => {
            if (position.character_id !== currentCharacterId) {
                const distance = calculateDistance(currentPosition, position);
                console.log(`[GameMap] Distance to character ${position.character_id}: ${distance.toFixed(2)}%`);
                
                if (distance < PROXIMITY_RADIUS) {
                    console.log(`[GameMap] Character ${position.character_id} is nearby! Distance: ${distance.toFixed(2)}%`);
                    nearby.push(currentCharacterId); // Add current character to nearby list
                }
            }
        });

        console.log('[GameMap] Nearby characters:', nearby);
        setNearbyCharacters(nearby);
    };

    const handleKeyPress = async (event: KeyboardEvent) => {
        if (!characterId || isMovingRef.current) return;

        const storedCharacterId = localStorage.getItem('currentGameCharacterId');
        if (!storedCharacterId) return;

        if (!currentPositionRef.current) {
            currentPositionRef.current = positions.find(p => p.character_id === parseInt(storedCharacterId)) || null;
            if (!currentPositionRef.current) return;
        }

        let newX = currentPositionRef.current.position_x;
        let newY = currentPositionRef.current.position_y;

        // Calculate new position based on key press
        switch (event.key) {
            case 'ArrowUp':
                newY = Math.max(0, currentPositionRef.current.position_y - MOVE_STEP);
                break;
            case 'ArrowDown':
                newY = Math.min(100, currentPositionRef.current.position_y + MOVE_STEP);
                break;
            case 'ArrowLeft':
                newX = Math.max(0, currentPositionRef.current.position_x - MOVE_STEP);
                break;
            case 'ArrowRight':
                newX = Math.min(100, currentPositionRef.current.position_x + MOVE_STEP);
                break;
            default:
                return;
        }

        // Only update if position actually changed
        if (newX === currentPositionRef.current.position_x && newY === currentPositionRef.current.position_y) {
            console.log('[GameMap] Position unchanged, skipping update');
            return;
        }

        console.log(`[GameMap] Current position: (${currentPositionRef.current.position_x}, ${currentPositionRef.current.position_y})`);
        console.log(`[GameMap] New position: (${newX}, ${newY})`);

        // Clear any existing timeout
        if (moveTimeoutRef.current) {
            clearTimeout(moveTimeoutRef.current);
        }

        isMovingRef.current = true;
        try {
            // Update local state immediately for smooth movement
            const newPosition = {
                ...currentPositionRef.current,
                position_x: newX,
                position_y: newY
            };
            currentPositionRef.current = newPosition;

            setPositions(prev => prev.map(pos => 
                pos.character_id === parseInt(storedCharacterId)
                    ? newPosition
                    : pos
            ));

            // Check for nearby characters
            checkProximity(newPosition);

            // Send update to server
            const response = await axios.put(`http://localhost:3001/api/game/move/${storedCharacterId}`, {
                position_x: newX,
                position_y: newY
            });
            console.log('[GameMap] Move response:', response.data);

            // Set a timeout to allow the next move
            moveTimeoutRef.current = setTimeout(() => {
                isMovingRef.current = false;
            }, 50); // 50ms delay between moves
        } catch (error) {
            console.error('[GameMap] Error moving character:', error);
            // Revert local state on error
            setPositions(prev => prev.map(pos => 
                pos.character_id === parseInt(storedCharacterId)
                    ? currentPositionRef.current!
                    : pos
            ));
            isMovingRef.current = false;
        }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault(); // Prevent page scrolling
            handleKeyPress(event);
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
                const characterMap: Record<number, Character> = {};
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

        // Add keyboard event listeners
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            console.log('[GameMap] Component unmounting, cleaning up...');
            newSocket.close();
            window.removeEventListener('keydown', handleKeyDown);
            if (moveTimeoutRef.current) {
                clearTimeout(moveTimeoutRef.current);
            }
            // Remove character ID from localStorage when component unmounts
            localStorage.removeItem('currentGameCharacterId');
        };
    }, [characterId, hasJoined]);

    // Update currentPositionRef when positions change
    useEffect(() => {
        const storedCharacterId = localStorage.getItem('currentGameCharacterId');
        if (storedCharacterId) {
            const newPosition = positions.find(p => p.character_id === parseInt(storedCharacterId));
            if (newPosition) {
                currentPositionRef.current = newPosition;
                checkProximity(newPosition);
            }
        }
    }, [positions]);

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

    const calculateDamage = (attacker: Character, defender: Character): number => {
        // Base damage is now much smaller and based on a percentage of the attacker's strength
        // Assuming abilities are now 1-100 instead of 1-10
        const baseDamage = Math.floor(attacker.abilities.strength * 0.02); // 2% of strength
        
        // Defense reduces damage by a percentage
        const defenseReduction = Math.floor(defender.abilities.defense * 0.01); // 1% of defense
        
        // Speed adds a small bonus/penalty (ensure we have valid numbers)
        const attackerSpeed = attacker.abilities.speed || 0;
        const defenderSpeed = defender.abilities.speed || 0;
        const speedFactor = Math.floor((attackerSpeed - defenderSpeed) * 0.005);
        
        // Calculate final damage (minimum 1)
        const damage = Math.max(1, baseDamage - defenseReduction + speedFactor);
        
        console.log(`[Fight] ${attacker.name} deals ${damage} damage to ${defender.name}`, {
            baseDamage,
            defenseReduction,
            speedFactor,
            attackerSpeed,
            defenderSpeed,
            attackerAbilities: attacker.abilities,
            defenderAbilities: defender.abilities
        });
        
        return damage;
    };

    // Initialize health for a character if it doesn't exist
    const initializeHealth = (characterId: number) => {
        setPlayerHealth(prev => {
            if (prev[characterId]) return prev; // Don't reset if health already exists
            
            return {
                ...prev,
                [characterId]: {
                    characterId,
                    health: 100,
                    maxHealth: 100
                }
            };
        });
    };

    // Initialize health for all characters when they first appear
    useEffect(() => {
        positions.forEach(position => {
            initializeHealth(position.character_id);
        });
    }, [positions]);

    const startFight = () => {
        if (isFighting) return;
        
        const currentCharacterId = parseInt(localStorage.getItem('currentGameCharacterId') || '0');
        const currentCharacter = characters[currentCharacterId];
        
        // Find current character's position
        const currentPosition = positions.find(p => p.character_id === currentCharacterId);
        if (!currentPosition) return;
        
        // Find the closest opponent
        const collidingOpponent = positions
            .filter(pos => pos.character_id !== currentCharacterId) // Exclude current character
            .map(pos => ({
                ...pos,
                distance: Math.sqrt(
                    Math.pow(pos.position_x - currentPosition.position_x, 2) +
                    Math.pow(pos.position_y - currentPosition.position_y, 2)
                )
            }))
            .sort((a, b) => a.distance - b.distance)[0]; // Get the closest opponent
        
        if (!collidingOpponent || !currentCharacter) return;
        
        // Only start fight if within 50 pixels
        if (collidingOpponent.distance > 50) return;
        
        const opponentCharacter = characters[collidingOpponent.character_id];
        if (!opponentCharacter) return;
        
        console.log('[Fight] Starting fight between:', {
            [currentCharacter.name]: currentCharacter.abilities,
            [opponentCharacter.name]: opponentCharacter.abilities,
            distance: collidingOpponent.distance
        });

        setIsFighting(true);

        // Start fight interval with much shorter delay between hits
        fightIntervalRef.current = setInterval(() => {
            setPlayerHealth(prev => {
                // Calculate damage for both players
                const damageToOpponent = calculateDamage(currentCharacter, opponentCharacter);
                const damageToCurrent = calculateDamage(opponentCharacter, currentCharacter);
                
                // Create new health state
                const newHealth = {
                    ...prev,
                    [collidingOpponent.character_id]: {
                        ...prev[collidingOpponent.character_id],
                        health: Math.max(0, prev[collidingOpponent.character_id].health - damageToOpponent)
                    },
                    [currentCharacterId]: {
                        ...prev[currentCharacterId],
                        health: Math.max(0, prev[currentCharacterId].health - damageToCurrent)
                    }
                };
                
                console.log('[Fight] Health Update:', {
                    [currentCharacter.name]: {
                        current: newHealth[currentCharacterId].health,
                        damageReceived: damageToCurrent,
                        damageDealt: damageToOpponent,
                        distance: collidingOpponent.distance
                    },
                    [opponentCharacter.name]: {
                        current: newHealth[collidingOpponent.character_id].health,
                        damageReceived: damageToOpponent,
                        damageDealt: damageToCurrent,
                        distance: collidingOpponent.distance
                    }
                });
                
                // Check if fight should end
                if (newHealth[collidingOpponent.character_id].health <= 0 || 
                    newHealth[currentCharacterId].health <= 0) {
                    if (fightIntervalRef.current) {
                        clearInterval(fightIntervalRef.current);
                        setIsFighting(false);
                        
                        console.log('[Fight] Fight ended!', {
                            winner: newHealth[collidingOpponent.character_id].health <= 0 ? currentCharacter.name : opponentCharacter.name,
                            finalHealth: {
                                [currentCharacter.name]: newHealth[currentCharacterId].health,
                                [opponentCharacter.name]: newHealth[collidingOpponent.character_id].health
                            }
                        });
                    }
                }
                
                return newHealth;
            });
        }, 100); // Fight every 100ms for more immediate damage
    };

    const stopFight = () => {
        if (fightIntervalRef.current) {
            clearInterval(fightIntervalRef.current);
            fightIntervalRef.current = null;
        }
        setIsFighting(false);
    };

    // Start fight when players are nearby
    useEffect(() => {
        const currentCharacterId = parseInt(localStorage.getItem('currentGameCharacterId') || '0');
        if (nearbyCharacters.includes(currentCharacterId) && !isFighting) {
            startFight();
        } else if (!nearbyCharacters.includes(currentCharacterId) && isFighting) {
            stopFight();
        }
    }, [nearbyCharacters, isFighting]);

    // Cleanup fight interval on unmount
    useEffect(() => {
        return () => {
            if (fightIntervalRef.current) {
                clearInterval(fightIntervalRef.current);
            }
        };
    }, []);

    return (
        <div className="game-map">
            <h1>Game Map</h1>
            <div className="map-container" style={{ position: 'relative', width: '800px', height: '600px', border: '1px solid black' }}>
                {/* Render circles for all players */}
                {positions.map((position) => {
                    const isNearby = nearbyCharacters.includes(position.character_id);
                    const currentCharacterId = parseInt(localStorage.getItem('currentGameCharacterId') || '0');
                    const isCurrentCharacter = position.character_id === currentCharacterId;

                    return (
                        <div
                            key={`circle-${position.character_id}`}
                            style={{
                                position: 'absolute',
                                left: `${position.position_x}%`,
                                top: `${position.position_y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '150px',
                                height: '150px',
                                border: `4px solid ${isNearby && isCurrentCharacter ? '#ff0000' : 'rgba(0, 255, 0, 0.3)'}`,
                                borderRadius: '50%',
                                pointerEvents: 'none',
                                zIndex: 0,
                                opacity: isNearby && isCurrentCharacter ? 0.8 : 0.3,
                                backgroundColor: isNearby && isCurrentCharacter ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)',
                                boxShadow: isNearby && isCurrentCharacter ? '0 0 20px rgba(255, 0, 0, 0.5)' : '0 0 20px rgba(0, 255, 0, 0.2)'
                            }}
                        />
                    );
                })}
                {/* Render characters and health bars */}
                {positions.map((position) => {
                    const character = characters[position.character_id];
                    const isNearby = nearbyCharacters.includes(position.character_id);
                    const currentCharacterId = parseInt(localStorage.getItem('currentGameCharacterId') || '0');
                    const isCurrentCharacter = position.character_id === currentCharacterId;
                    const health = playerHealth[position.character_id];

                    return character ? (
                        <div key={`${position.character_id}-${position.id}`}>
                            {/* Health bar */}
                            {health && (
                                <div style={{
                                    position: 'absolute',
                                    left: `${position.position_x}%`,
                                    top: `${position.position_y}%`,
                                    transform: 'translate(-50%, -150%)',
                                    width: '100px',
                                    height: '10px',
                                    backgroundColor: '#333',
                                    borderRadius: '5px',
                                    zIndex: 2
                                }}>
                                    <div style={{
                                        width: `${(health.health / health.maxHealth) * 100}%`,
                                        height: '100%',
                                        backgroundColor: health.health > 50 ? '#2ecc71' : health.health > 25 ? '#f1c40f' : '#e74c3c',
                                        borderRadius: '5px',
                                        transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out'
                                    }} />
                                </div>
                            )}
                            {/* Character */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: `${position.position_x}%`,
                                    top: `${position.position_y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: `${CHARACTER_RADIUS * 2}px`,
                                    height: `${CHARACTER_RADIUS * 2}px`,
                                    backgroundImage: `url(${character.image})`,
                                    backgroundSize: 'cover',
                                    borderRadius: '50%',
                                    border: isNearby && isCurrentCharacter ? '3px solid red' : '2px solid white',
                                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                                    transition: 'border-color 0.2s ease-in-out',
                                    zIndex: 1
                                }}
                                title={`${character.name}${isNearby && isCurrentCharacter ? ' (Nearby)' : ''}`}
                            />
                        </div>
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