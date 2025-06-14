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

const WS_URL = 'ws://localhost:3001';

const Statistics: React.FC = () => {
  const { characters, addCharacter } = useCharacters();
  const [chartData, setChartData] = useState<any>(null);
  const [barData, setBarData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'NEW_CHARACTER':
          addCharacter(data.character);
          break;
        case 'GENERATION_STARTED':
          setIsGenerating(true);
          break;
        case 'GENERATION_STOPPED':
          setIsGenerating(false);
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [addCharacter]);

  const startGenerating = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'START_GENERATION' }));
    }
  };

  const stopGenerating = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'STOP_GENERATION' }));
    }
  };

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