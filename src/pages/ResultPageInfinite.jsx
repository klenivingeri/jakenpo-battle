import { useNavigate, useLocation } from 'react-router-dom';
import { ResultScene } from '../components/Scene/ResultScene';

function ResultPageInfinite() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameStats = location.state?.stats || { 
    result: 'loss', 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    gold: 0, 
    phasesCompleted: 0,
    totalTime: 0
  };

  const handleSetScene = (scene) => {
    if (scene === 'Init') {
      navigate('/init');
    } else if (scene === 'GameInfinite') {
      navigate('/game-infinite');
    } else if (scene === 'Start') {
      navigate('/');
    }
  };

  return (
    <ResultScene 
      gameStats={gameStats} 
      setScene={handleSetScene}
      isInfiniteMode={true}
    />
  );
}

export default ResultPageInfinite;
