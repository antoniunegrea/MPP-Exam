import React, { useEffect, useState, useRef } from 'react';
import { useCharacters } from '../context/CharacterContext';
import { Character } from '../types/Character';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import './Statistics.css';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Statistics: React.FC = () => {
  const { characters, addCharacter } = useCharacters();
  const [chartData, setChartData] = useState<any>(null);
  const [barData, setBarData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateRandomCharacter = (): Omit<Character, 'id'> => {
    const names = ['Warrior', 'Mage', 'Archer', 'Knight', 'Rogue', 'Paladin', 'Wizard', 'Berserker', 'Monk', 'Druid'];
    const randomName = `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 1000)}`;
    
    return {
      name: randomName,
      image: 'https://picsum.photos/200',
      abilities: {
        strength: Math.floor(Math.random() * 100),
        agility: Math.floor(Math.random() * 100),
        defense: Math.floor(Math.random() * 100)
      }
    };
  };

  const startGenerating = () => {
    if (!isGenerating) {
      setIsGenerating(true);
      intervalRef.current = setInterval(() => {
        addCharacter(generateRandomCharacter());
      }, 1000);
    }
  };

  const stopGenerating = () => {
    if (isGenerating && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsGenerating(false);
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Prepare data for pie chart (distribution of strength values)
    const strengthRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    characters.forEach((char: Character) => {
      if (char.abilities.strength <= 20) strengthRanges['0-20']++;
      else if (char.abilities.strength <= 40) strengthRanges['21-40']++;
      else if (char.abilities.strength <= 60) strengthRanges['41-60']++;
      else if (char.abilities.strength <= 80) strengthRanges['61-80']++;
      else strengthRanges['81-100']++;
    });

    setChartData({
      labels: Object.keys(strengthRanges),
      datasets: [{
        data: Object.values(strengthRanges),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    });

    // Prepare data for bar chart (average stats)
    const totalStats = characters.reduce((acc: { strength: number; agility: number; defense: number }, char: Character) => ({
      strength: acc.strength + char.abilities.strength,
      agility: acc.agility + char.abilities.agility,
      defense: acc.defense + char.abilities.defense
    }), { strength: 0, agility: 0, defense: 0 });

    const avgStats = {
      strength: totalStats.strength / characters.length,
      agility: totalStats.agility / characters.length,
      defense: totalStats.defense / characters.length
    };

    setBarData({
      labels: ['Strength', 'Agility', 'Defense'],
      datasets: [{
        label: 'Average Stats',
        data: [avgStats.strength, avgStats.agility, avgStats.defense],
        backgroundColor: '#36A2EB'
      }]
    });
  }, [characters]);

  return (
    <div className="statistics-container">
      <h1>Character Statistics</h1>
      
      <div className="charts-container">
        <div className="chart">
          <h2>Strength Distribution</h2>
          {chartData && <Pie data={chartData} />}
        </div>
        
        <div className="chart">
          <h2>Average Stats</h2>
          {barData && <Bar data={barData} />}
        </div>
      </div>

      <button 
        className={`generate-button ${isGenerating ? 'stop' : 'start'}`} 
        onClick={isGenerating ? stopGenerating : startGenerating}
      >
        {isGenerating ? 'Stop Generation' : 'Start Generation'}
      </button>
    </div>
  );
};

export default Statistics; 