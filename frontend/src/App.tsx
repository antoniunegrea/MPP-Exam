import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CharacterDetails from './pages/CharacterDetails';
import AddCharacter from './pages/AddCharacter';
import EditCharacter from './pages/EditCharacter';
import Statistics from './pages/Statistics';
import { CharacterProvider } from './context/CharacterContext';
import './App.css';

function App() {
  return (
    <CharacterProvider>
      <Router>
        <div className="app">
          <nav className="nav-bar">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/add" className="nav-link">Add Character</Link>
            <Link to="/statistics" className="nav-link">Statistics</Link>
          </nav>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/:id" element={<CharacterDetails />} />
            <Route path="/add" element={<AddCharacter />} />
            <Route path="/edit/:id" element={<EditCharacter />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </Router>
    </CharacterProvider>
  );
}

export default App;
