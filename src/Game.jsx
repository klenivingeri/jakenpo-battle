import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './Animate.css';
import { GameScene } from './components/Scene/GameScene';
import { InitScene } from './components/Scene/InitScene';
import { ResultScene } from './components/Scene/ResultScene';
import { toggleFullScreen } from './help/fullScreen';
import { calculateUnlockCost } from './utils/economyUtils';
import {
  getPlayerRegistry,
  getIsMusicOn,
  setIsMusicOn,
  getIsEconomyDebugOn,
  getRoomCurrent,
  getGameStats,
  getRoomStars,
  saveToStorage,
  STORAGE_KEYS
} from './utils/storageUtils';

function Game({ initialScene = 'Start' }) {
  const navigate = useNavigate();
  const [player, setPlayer] = useState({ hp: 10, atk: 1 });
  const [enemy, setEnemy] = useState({ hp: 10, atk: 1 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [scene, setScene] = useState(initialScene);
  const [isMusicOn, setIsMusicOnState] = useState(() => getIsMusicOn());
  const [isEconomyDebugOn, setIsEconomyDebugOnState] = useState(() => getIsEconomyDebugOn());

  // Sincroniza o estado da cena quando a prop initialScene mudar
  useEffect(() => {
    setScene(initialScene);
  }, [initialScene]);



  const [roomCurrent, setRoomCurrent] = useState(() => getRoomCurrent());

  const [gameStats, setGameStats] = useState(() => getGameStats());

  const [roomStars, setRoomStars] = useState(() => getRoomStars());
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());

    const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));

  useEffect(() => {
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.05; // Volume 20

    return () => {
      backgroundMusic.current.pause();
    };
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOM_CURRENT, roomCurrent);
    saveToStorage(STORAGE_KEYS.GAME_STATS, gameStats);
    saveToStorage(STORAGE_KEYS.ROOM_STARS, roomStars);
    saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, playerRegistry);
  }, [roomCurrent, gameStats, roomStars, playerRegistry]);

  useEffect(() => {
    setIsMusicOn(isMusicOn);
  }, [isMusicOn]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsEconomyDebugOnState(getIsEconomyDebugOn());
    };
    
    const handleEconomyDebugChanged = () => {
      setIsEconomyDebugOnState(getIsEconomyDebugOn());
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('economyDebugChanged', handleEconomyDebugChanged);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('economyDebugChanged', handleEconomyDebugChanged);
    };
  }, []);

  const handleInit = () => {
    navigate('/init');
  }

  const rooms = useMemo(() => Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;

    // Reseta a curva de velocidade/spawn a cada 30 níveis
    const resetIndex = i % 30;

    // Velocidade: sobe de 2.0 a 7.6 dentro de cada bloco de 30 níveis
    const baseSpeed = 2 + (Math.floor(resetIndex / 2) * 0.40);

    // Spawn: fica mais rápido até o meio de cada bloco
    const baseSpawnInterval = Math.max(600, 3000 - (Math.min(resetIndex, 20) * 100));

    // Sistema de drops de raridade baseado no nível
    // Conforme sobe o nível, aumenta a chance de bullets raros
    const progressFactor = Math.min(i / 99, 1); // 0 a 1
    
    const commonDrop = Math.max(10, 100 - (progressFactor * 60)); // 100 -> 40
    const uncommonDrop = Math.min(30, progressFactor * 30); // 0 -> 30
    const rareDrop = Math.min(20, progressFactor * 20); // 0 -> 20
    const heroicDrop = Math.min(15, progressFactor * 15); // 0 -> 15
    const legendaryDrop = Math.min(10, progressFactor * 10); // 0 -> 10
    const mythicDrop = Math.min(8, progressFactor * 8); // 0 -> 8
    const immortalDrop = Math.min(7, progressFactor * 7); // 0 -> 7
    
    // Normalizar para somar 100
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
      disableButton: i > roomCurrent,
      enemy: enemyConfig
    };
  }), [roomCurrent]);
  
  // Calcula unlock costs baseado na fase ATUAL
  const roomsWithCosts = useMemo(() => {
    return rooms.map((room) => {
      // O custo é baseado no gold da FASE ATUAL
      // Jogando a fase X duas vezes, você desbloqueia a fase X+1
      const unlockCost = calculateUnlockCost(room.id, room);
      return { ...room, unlockCost };
    });
  }, [rooms]);

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  const handleGameEnd = (stats) => {
    let stars = 0;
    if (stats.result === 'win') {
      stars = player.hp >= 10 ? 3 : player.hp >= 5 ? 2 : 1;
      const newStars = [...roomStars];
      if (stars > newStars[activeRoomIndex]) {
        newStars[activeRoomIndex] = stars;
        setRoomStars(newStars);
      }
      // Removido o auto-desbloqueio - agora só desbloqueia comprando com gold
    }
    
    // Atualizar registry do player com gold e xp ganhos
    if (stats.gold > 0) {
      setPlayerRegistry(prev => {
        const newGold = prev.gold + stats.gold;
        const newXp = prev.xp + stats.gold * 10; // 10 XP por gold
        const newLevel = Math.floor(newXp / 100) + 1; // Nível a cada 100 XP
        
        return {
          ...prev,
          gold: newGold,
          xp: newXp,
          level: newLevel
        };
      });
    }
    
    setGameStats({ ...stats, stars });
    backgroundMusic.current.pause();
    setScene('EndResult');
  };

  const handleStartGame = (index) => {
    setPlayer(p => ({ ...p, hp: 10 })); // Reset player HP
    setEnemy(e => ({ ...e, hp: 10 })); // Reset enemy HP
    setActiveRoomIndex(index);
    if(isMusicOn){
      backgroundMusic.current.play();
    }
    
    setScene('Game');
  };

  const currentRoom = roomsWithCosts[activeRoomIndex];

  const stateScene = {
    Start: (
      <div className='botao-pulsar' style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center',
        width: '100%',
        height: '100%'
      }}>
        <div style={{
          marginTop: '-20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img src="/assets/logo2.png" />
          <button className='button_footer' onClick={() => handleInit()}> Iniciar</button>
        </div>
      </div>),
    Init: (
      <InitScene 
        setScene={setScene} 
        rooms={roomsWithCosts} 
        setRoomCurrent={setRoomCurrent}
        setActiveRoomIndex={setActiveRoomIndex}
        roomCurrent={roomCurrent}
        roomStars={roomStars}
        playerRegistry={playerRegistry}
        setPlayerRegistry={setPlayerRegistry}
        isMusicOn={isMusicOn}
        setIsMusicOn={setIsMusicOn}
      />
    ),
    Game: (
      <GameScene
        handleBullet={handleBullet}
        player={player}
        setPlayer={setPlayer}
        enemy={{ ...enemy, atk: 1 }}
        setEnemy={setEnemy}
        disableButtonPlayer={disableButtonPlayer}
        setdisableButtonPlayer={setdisableButtonPlayer}
        setScene={setScene}
        handleGameEnd={handleGameEnd}
        gameDuration={currentRoom.gameDuration}
        speed={currentRoom.speed}
        spawnInterval={currentRoom.spawnInterval}
        bulletsPerSpawn={currentRoom.bulletsPerAction}
        roomLevel={currentRoom.id}
        enemyDropConfig={currentRoom.enemy}
        isEconomyDebugOn={isEconomyDebugOn}
      />
    ),
    EndResult: (
      <ResultScene gameStats={gameStats} setScene={setScene} />
    ),
  };
  
  return stateScene[scene];
}

export default Game


