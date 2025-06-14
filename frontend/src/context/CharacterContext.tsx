import React, { createContext, useContext, useState } from 'react';
import { Character, characters as initialCharacters } from '../types/Character';

interface CharacterContextType {
  characters: Character[];
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: number, character: Omit<Character, 'id'>) => void;
  deleteCharacter: (id: number) => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);

  const addCharacter = (newCharacter: Omit<Character, 'id'>) => {
    setCharacters(prevCharacters => [
      ...prevCharacters,
      {
        ...newCharacter,
        id: prevCharacters.length + 1
      }
    ]);
  };

  const updateCharacter = (id: number, updatedCharacter: Omit<Character, 'id'>) => {
    setCharacters(prevCharacters =>
      prevCharacters.map(character =>
        character.id === id
          ? { ...updatedCharacter, id }
          : character
      )
    );
  };

  const deleteCharacter = (id: number) => {
    setCharacters(prevCharacters =>
      prevCharacters.filter(character => character.id !== id)
    );
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