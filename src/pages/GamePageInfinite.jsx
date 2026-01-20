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
  
  // Estados específicos do modo infinito
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [accumulatedGold, setAccumulatedGold] = useState(0);
  const [accumulatedStats, setAccumulatedStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState(30); // Timer da fase atual

  const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));

  useEffect(() => {
    const audio = backgroundMusic.current;
    audio.loop = true;
    audio.volume = 0.05;
    audio.play().catch(e => console.log('Audio play failed:', e));

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    };
  }, []);

  // Gera a configuração de todas as 100 fases
  const rooms = useMemo(() => generateRooms(), []);

  const currentRoom = rooms[currentPhase];

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  // Função chamada quando uma fase é completada (tempo acabou mas player ainda vivo)
  const handlePhaseComplete = () => {
    // Avança para próxima fase
    const nextPhase = currentPhase + 1;
    
    if (nextPhase >= rooms.length) {
      // Jogador completou todas as 100 fases!
      handleGameEnd({
        result: 'win',
        phasesCompleted: currentPhase + 1,
        totalTime: totalTime
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
    />
  );
}

export default GamePageInfinite;
