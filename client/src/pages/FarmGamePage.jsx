import React from 'react';
import { useNavigate } from 'react-router-dom';
import FarmGameSimulation from '../components/simulation/FarmGameSimulation';

export default function FarmGamePage() {
  const navigate = useNavigate();

  return (
    <FarmGameSimulation 
      isOpen={true} 
      onClose={() => navigate('/today')} 
    />
  );
}
