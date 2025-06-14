import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Character } from '../types/Character';

interface CharacterContextType {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: number, character: Omit<Character, 'id'>) => void;
  deleteCharacter: (id: number) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

const WS_URL = 'ws://localhost:3001';

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'INITIAL_CHARACTERS':
          setCharacters(data.characters);
          break;
        case 'NEW_CHARACTER':
          setCharacters(prev => [...prev, data.character]);
          break;
        case 'CHARACTER_UPDATED':
          setCharacters(prev => prev.map(char => 
            char.id === data.character.id ? data.character : char
          ));
          break;
        case 'CHARACTER_DELETED':
          setCharacters(prev => prev.filter(char => char.id !== data.id));
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const addCharacter = (character: Omit<Character, 'id'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ADD_CHARACTER',
        character
      }));
    }
  };

  const updateCharacter = (id: number, character: Omit<Character, 'id'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UPDATE_CHARACTER',
        id,
        character
      }));
    }
  };

  const deleteCharacter = (id: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'DELETE_CHARACTER',
        id
      }));
    }
  };

  return (
    <CharacterContext.Provider value={{ characters, addCharacter, updateCharacter, deleteCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacters = () => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}; 