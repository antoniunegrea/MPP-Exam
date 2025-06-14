import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CharacterDetails from './pages/CharacterDetails';
import AddCharacter from './pages/AddCharacter';
import EditCharacter from './pages/EditCharacter';
import { CharacterProvider } from './context/CharacterContext';
import './App.css';

function App() {
  return (
    <CharacterProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/:id" element={<CharacterDetails />} />
            <Route path="/add" element={<AddCharacter />} />
            <Route path="/edit/:id" element={<EditCharacter />} />
          </Routes>
        </div>
      </Router>
    </CharacterProvider>
  );
}

export default App;
