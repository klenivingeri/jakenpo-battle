import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameScene } from '../components/Scene/GameScene';
import { generateRooms } from '../utils/roomUtils';
import {
  getPlayerRegistry,
  getIsEconomyDebugOn,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/storageUtils';

function GamePageInfinite() {
  const navigate = useNavigate();

  const [player, setPlayer] = useState({ hp: 10, atk: 1 });
  const [enemy, setEnemy] = useState({ hp: 10, atk: 1 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [isEconomyDebugOn] = useState(() => getIsEconomyDebugOn());
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // Estado do multiplicador de velocidade
  
  // Estados específicos do modo infinito
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [accumulatedGold, setAccumulatedGold] = useState(0);
  const [accumulatedStats, setAccumulatedStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState(30); // Timer da fase atual

  const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    const audio = backgroundMusic.current;
    audio.loop = true;
    audio.volume = 0.05;

    const startAudio = () => {
      if (!audioStarted) {
        audio.play().catch(e => {});
        setAudioStarted(true);
      }
    };

    // Tenta reproduzir o áudio quando o usuário interagir com a página
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => document.addEventListener(event, startAudio, { once: true }));

    return () => {
      events.forEach(event => document.removeEventListener(event, startAudio));
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    };
  }, [audioStarted]);

  // Gera a configuração de todas as 100 fases
  const rooms = useMemo(() => generateRooms(), []);

  const currentRoom = rooms[currentPhase];

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  // Callback para mudança de velocidade
  const handleSpeedChange = (newSpeed) => {
    setSpeedMultiplier(newSpeed);
  };

  // Função chamada quando uma fase é completada (tempo acabou mas player ainda vivo)
  const handlePhaseComplete = () => {
    const nextPhase = currentPhase + 1;

    if (nextPhase >= rooms.length) {
      // Jogador completou todas as 100 fases!
      handleGameEnd({
        result: 'win',
        phasesCompleted: currentPhase + 1,
        totalTime: totalTime,
        speedValidation: totalTime / speedMultiplier > currentRoom.gameDuration / 2
      });
    } else {
      setCurrentPhase(nextPhase);
      // Não reseta nada - apenas avança a fase
    }
  };

  // Função chamada quando o jogo termina (player morreu)
  const handleGameEnd = (stats) => {
    // Salva o gold acumulado
    if (stats.gold > 0) {
      setPlayerRegistry(prev => {
        const newGold = prev.gold + stats.gold;
        const newXp = prev.xp + stats.gold * 10;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, {
          ...prev,
          gold: newGold,
          xp: newXp,
          level: newLevel
        });
        
        return {
          ...prev,
          gold: newGold,
          xp: newXp,
          level: newLevel
        };
      });
    }
    
    backgroundMusic.current.pause();
    navigate('/result-infinite', { 
      state: { 
        stats: {
          ...stats,
          phasesCompleted: stats.phasesCompleted || currentPhase,
          totalTime: stats.totalTime || totalTime
        }
      } 
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedMultiplier((prevSpeed) => Math.min(prevSpeed + 0.1, 3));
    }, 10000); // Aumenta a velocidade a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <GameScene
      handleBullet={handleBullet}
      player={player}
      setPlayer={setPlayer}
      enemy={{ ...enemy, atk: 1 }}
      setEnemy={setEnemy}
      disableButtonPlayer={disableButtonPlayer}
      setdisableButtonPlayer={setdisableButtonPlayer}
      handleGameEnd={handleGameEnd}
      handlePhaseComplete={handlePhaseComplete}
      gameDuration={currentRoom.gameDuration}
      speed={currentRoom.speed}
      spawnInterval={currentRoom.spawnInterval}
      bulletsPerSpawn={currentRoom.bulletsPerAction}
      roomLevel={currentRoom.id}
      enemyDropConfig={currentRoom.enemy}
      isEconomyDebugOn={isEconomyDebugOn}
      isInfiniteMode={true}
      currentPhase={currentPhase + 1}
      totalTime={totalTime}
      timeLeft={timeLeft}
      setTimeLeft={setTimeLeft}
      speedMultiplier={speedMultiplier}
      onSpeedChange={handleSpeedChange}
      isSpecialMode={true}
    />
  );
}

export default GamePageInfinite;
