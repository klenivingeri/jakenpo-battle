import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResultScene } from '../components/Scene/ResultScene';

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameStats = location.state?.stats || { result: 'loss', wins: 0, losses: 0, draws: 0, gold: 0, stars: 0 };

  useEffect(() => {
    // Marca que entramos na página de resultado
    sessionStorage.setItem('lastPage', '/result');
    console.log('Entrou na página de resultado');

    // Adiciona um estado ao histórico para controlar a navegação
    window.history.pushState({ fromResult: true }, '');

    const handlePopState = (event) => {
      console.log('PopState acionado na página de resultado');
      console.log('Estado do evento:', event.state);
      
      // Se estiver voltando da página de resultado, redireciona para init
      const lastPage = sessionStorage.getItem('lastPage');
      console.log('Última página:', lastPage);
      
      if (lastPage === '/result') {
        console.log('Redirecionando para /init');
        sessionStorage.removeItem('lastPage');
        navigate('/init', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleSetScene = (scene) => {
    sessionStorage.removeItem('lastPage');
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
