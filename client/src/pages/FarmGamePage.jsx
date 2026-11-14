import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FarmGameSimulation from '../components/simulation/FarmGameSimulation';

export default function FarmGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStrategyId = searchParams.get('strategy');

  return (
    <FarmGameSimulation 
      isOpen={true} 
      initialStrategyId={initialStrategyId}
      onClose={() => navigate(-1)} 
    />
  );
}

