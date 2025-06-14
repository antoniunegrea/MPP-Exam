import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCharacters } from '../context/CharacterContext';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { characters, deleteCharacter } = useCharacters();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(id);
    }
  };

  return (
    <div className="home-page">
      <div className="header">
        <h1>Game Characters</h1>
        <button className="add-button" onClick={() => navigate('/add')}>
          Add Character
        </button>
      </div>
      <div className="characters-grid">
        {characters.map((character) => (
          <Link to={`/character/${character.id}`} key={character.id} className="character-card">
            <img src={character.image} alt={character.name} />
            <div className="character-info">
              <h2>{character.name}</h2>
              <div className="character-actions">
                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/edit/${character.id}`);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => handleDelete(e, character.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 