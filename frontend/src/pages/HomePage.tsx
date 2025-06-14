import React from 'react';
import { Link } from 'react-router-dom';
import { characters } from '../types/Character';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Game Characters</h1>
      <div className="characters-grid">
        {characters.map((character) => (
          <Link to={`/character/${character.id}`} key={character.id} className="character-card">
            <img src={character.image} alt={character.name} />
            <h2>{character.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 