import React, { createContext, useContext, useState, useEffect } from 'react';
import { Character } from '../types/Character';
//const API_URL = 'https://mpp-exam-production.up.railway.app/api/characters';
const API_URL = 'http://localhost:3001/api/characters';

interface CharacterContextType {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id'>) => Promise<void>;
  updateCharacter: (id: number, character: Omit<Character, 'id'>) => Promise<void>;
  deleteCharacter: (id: number) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);

  // Fetch characters on mount
  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const addCharacter = async (newCharacter: Omit<Character, 'id'>) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCharacter),
      });
      const data = await response.json();
      setCharacters(prevCharacters => [...prevCharacters, data]);
    } catch (error) {
      console.error('Error adding character:', error);
    }
  };

  const updateCharacter = async (id: number, updatedCharacter: Omit<Character, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCharacter),
      });
      const data = await response.json();
      setCharacters(prevCharacters =>
        prevCharacters.map(character =>
          character.id === id ? data : character
        )
      );
    } catch (error) {
      console.error('Error updating character:', error);
    }
  };

  const deleteCharacter = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      setCharacters(prevCharacters =>
        prevCharacters.filter(character => character.id !== id)
      );
    } catch (error) {
      console.error('Error deleting character:', error);
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