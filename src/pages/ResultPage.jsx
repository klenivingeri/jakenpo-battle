import { useNavigate, useLocation } from 'react-router-dom';
import { ResultScene } from '../components/Scene/ResultScene';

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameStats = location.state?.stats || { result: 'loss', wins: 0, losses: 0, draws: 0, gold: 0, stars: 0 };

  const handleSetScene = (scene) => {
    if (scene === 'Init') {
      navigate('/init');
    } else if (scene === 'Start') {
      navigate('/');
    }
  };

  return (
    <ResultScene 
      gameStats={gameStats} 
      setScene={handleSetScene} 
    />
  );
}

export default ResultPage;
