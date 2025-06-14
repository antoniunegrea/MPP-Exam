import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCharacters } from '../context/CharacterContext';
import './AddCharacter.css';

const EditCharacter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { characters, updateCharacter } = useCharacters();
  const character = characters.find(c => c.id === Number(id));

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    strength: 50,
    agility: 50,
    defense: 50
  });

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        image: character.image,
        strength: character.abilities.strength,
        agility: character.abilities.agility,
        defense: character.abilities.defense
      });
    }
  }, [character]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'image' ? value : Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!character) return;

    // Create updated character
    const updatedCharacter = {
      name: formData.name,
      image: formData.image,
      abilities: {
        strength: formData.strength,
        agility: formData.agility,
        defense: formData.defense
      }
    };

    // Update the character using context
    updateCharacter(character.id, updatedCharacter);
    
    // Navigate back to home page
    navigate('/');
  };

  if (!character) {
    return (
      <div className="add-character">
        <h1>Character not found</h1>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="add-character">
      <button className="back-button" onClick={() => navigate('/')}>← Back to Home</button>
      <div className="form-container">
        <h1>Edit Character</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Character Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image URL:</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="strength">Strength: {formData.strength}</label>
            <input
              type="range"
              id="strength"
              name="strength"
              min="0"
              max="100"
              step="0.1"
              value={formData.strength}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="agility">Agility: {formData.agility}</label>
            <input
              type="range"
              id="agility"
              name="agility"
              min="0"
              max="100"
              step="0.1"
              value={formData.agility}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="defense">Defense: {formData.defense}</label>
            <input
              type="range"
              id="defense"
              name="defense"
              min="0"
              max="100"
              step="0.1"
              value={formData.defense}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-button">Update Character</button>
        </form>
      </div>
    </div>
  );
};

export default EditCharacter; 