import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characters } from '../types/Character';
import './CharacterDetails.css';

const CharacterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const character = characters.find(c => c.id === Number(id));

  if (!character) {
    return (
      <div className="character-details">
        <h1>Character not found</h1>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="character-details">
      <button className="back-button" onClick={() => navigate('/')}>← Back to Home</button>
      <div className="character-content">
        <img src={character.image} alt={character.name} />
        <div className="character-info">
          <h1>{character.name}</h1>
          <div className="abilities">
            <h2>Abilities:</h2>
            <div className="ability-stats">
              <div className="ability">
                <span className="ability-name">Strength</span>
                <div className="ability-bar">
                  <div 
                    className="ability-fill" 
                    style={{ width: `${character.abilities.strength}%` }}
                  />
                </div>
                <span className="ability-value">{character.abilities.strength}</span>
              </div>
              <div className="ability">
                <span className="ability-name">Agility</span>
                <div className="ability-bar">
                  <div 
                    className="ability-fill" 
                    style={{ width: `${character.abilities.agility}%` }}
                  />
                </div>
                <span className="ability-value">{character.abilities.agility}</span>
              </div>
              <div className="ability">
                <span className="ability-name">Intelligence</span>
                <div className="ability-bar">
                  <div 
                    className="ability-fill" 
                    style={{ width: `${character.abilities.intelligence}%` }}
                  />
                </div>
                <span className="ability-value">{character.abilities.intelligence}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetails; 