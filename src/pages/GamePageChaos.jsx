import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JankenpoChaos from '../components/Jankenpo/JankenpoChaos';
import { Footer } from '../components/HUD/Control';
import EconomyDebug from '../components/debug/EconomyDebug';
import {
  getPlayerRegistry,
  getIsEconomyDebugOn,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/storageUtils';

function GamePageChaos() {
  const navigate = useNavigate();

  const [player, setPlayer] = useState({ hp: 10, atk: 1 });
  const [enemy, setEnemy] = useState({ hp: 10, atk: 1 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [isEconomyDebugOn] = useState(() => getIsEconomyDebugOn());
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());
  
  // Estados específicos do modo caos
  const [currentPhase, setCurrentPhase] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [accumulatedGold, setAccumulatedGold] = useState(0);
  const [accumulatedStats, setAccumulatedStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [timeLeft, setTimeLeft] = useState(30);

  const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));

  useEffect(() => {
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.05;
    backgroundMusic.current.play().catch(e => console.log('Audio play failed:', e));

    return () => {
      backgroundMusic.current.pause();
    };
  }, []);

  // Gera a configuração de todas as 100 fases do modo caos
  const rooms = useMemo(() => Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const resetIndex = i % 30;

    // Velocidade mais alta que o modo infinito para aumentar o caos
    const baseSpeed = 2.5 + (Math.floor(resetIndex / 2) * 0.5);
    
    // Spawn mais rápido para criar mais caos
    const baseSpawnInterval = Math.max(400, 2500 - (Math.min(resetIndex, 20) * 80));

    const progressFactor = Math.min(i / 99, 1);
    
    // Configuração de drops progressivos
    const commonDrop = Math.max(10, 100 - (progressFactor * 60));
    const uncommonDrop = Math.min(30, progressFactor * 30);
    const rareDrop = Math.min(20, progressFactor * 20);
    const heroicDrop = Math.min(15, progressFactor * 15);
    const legendaryDrop = Math.min(10, progressFactor * 10);
    const mythicDrop = Math.min(8, progressFactor * 8);
    const immortalDrop = Math.min(7, progressFactor * 7);
    
    const total = commonDrop + uncommonDrop + rareDrop + heroicDrop + legendaryDrop + mythicDrop + immortalDrop;
    
    const enemyConfig = {
      common: { drop: (commonDrop / total) * 100 },
      uncommon: { drop: (uncommonDrop / total) * 100 },
      rare: { drop: (rareDrop / total) * 100 },
      heroic: { drop: (heroicDrop / total) * 100 },
      legendary: { drop: (legendaryDrop / total) * 100 },
      mythic: { drop: (mythicDrop / total) * 100 },
      immortal: { drop: (immortalDrop / total) * 100 }
    };
    
    return {
      id: level,
      gameDuration: 30 + resetIndex,
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      bulletsPerAction: 1,
      enemy: enemyConfig,
      isChaosMode: true
    };
  }), []);

  const currentRoom = rooms[currentPhase];

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  // Função chamada quando uma fase é completada
  const handlePhaseComplete = () => {
    setTotalTime(prev => prev + currentRoom.gameDuration);

    const nextPhase = currentPhase + 1;
    
    if (nextPhase >= rooms.length) {
      // Jogador completou todas as 100 fases!
      handleGameEnd({
        result: 'win',
        phasesCompleted: currentPhase + 1,
        totalTime: totalTime + currentRoom.gameDuration
      });
    } else {
      setCurrentPhase(nextPhase);
      setTimeLeft(rooms[nextPhase].gameDuration);
    }
  };

  // Função chamada quando o jogo termina
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
    navigate('/result-chaos', { 
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
    <div className='container_game_scene'>
      {/* Badge do Modo Caos */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
        padding: '5px 15px',
        borderRadius: '10px',
        fontWeight: 'bold',
        fontSize: '1rem',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        zIndex: 1000,
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 15px rgba(255, 0, 0, 0.5)',
      }}>
        🌪️ MODO CAOS {currentPhase + 1} 🌪️
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <JankenpoChaos
          handleBullet={handleBullet}
          player={player}
          setPlayer={setPlayer}
          enemy={{ ...enemy, atk: 1 }}
          setEnemy={setEnemy}
          setdisableButtonPlayer={setdisableButtonPlayer}
          handleGameEnd={handleGameEnd}
          handlePhaseComplete={handlePhaseComplete}
          gameDuration={currentRoom.gameDuration}
          speed={currentRoom.speed}
          spawnInterval={currentRoom.spawnInterval}
          roomLevel={currentRoom.id}
          currentPhase={currentPhase + 1}
          totalTime={totalTime}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          enemyDropConfig={currentRoom.enemy}
        />
        
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100%',
            background: 'white',
            opacity: 0.7,
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            top: 0
          }}
        />
        
        {isEconomyDebugOn && (
          <EconomyDebug 
            roomLevel={currentRoom.id}
            enemyDropConfig={currentRoom.enemy}
            gameDuration={currentRoom.gameDuration}
            spawnInterval={currentRoom.spawnInterval}
          />
        )}
      </div>
      
      <Footer 
        handleBullet={handleBullet}
        player={player}
        disableButtonPlayer={disableButtonPlayer}
      />
    </div>
  );
}

export default GamePageChaos;
