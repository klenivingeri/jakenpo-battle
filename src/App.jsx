import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import './Animate.css';
import { GameScene } from './components/Scene/GameScene';
import { InitScene } from './components/Scene/InitScene';
import { ResultScene } from './components/Scene/ResultScene';
import { toggleFullScreen } from './help/fullScreen';

function App() {
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const [player, setPlayer] = useState({ hp: 10, atk: 1 });
  const [enemy, setEnemy] = useState({ hp: 10, atk: 1 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [scene, setScene] = useState('Start');

  useEffect(() => {
    // Ambiente sem window (SSR / build)
    if (typeof window === 'undefined') return;

    // API não existe
    if (!('DeviceOrientationEvent' in window)) {
      console.log('DeviceOrientation não suportado');
      return;
    }

    let rafId = null;
    let enabled = true;

    const handleOrientation = (event) => {
      if (!enabled || rafId) return;

      rafId = requestAnimationFrame(() => {
        // Alguns dispositivos retornam null
        const gamma = typeof event.gamma === 'number' ? event.gamma : 0;
        const beta  = typeof event.beta === 'number' ? event.beta : 0;

        const x = 50 + gamma * 0.2;
        const y = 50 + beta * 0.1;

        setBgPos(prev => {
          const nx = Math.max(0, Math.min(100, x));
          const ny = Math.max(0, Math.min(100, y));
          if (prev.x === nx && prev.y === ny) return prev;
          return { x: nx, y: ny };
        });

        rafId = null;
      });
    };

    const start = async () => {
      try {
        // iOS (precisa de permissão explícita)
        if (
          typeof window.DeviceOrientationEvent?.requestPermission === 'function'
        ) {
          const permission = await window.DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') return;
        }

        window.addEventListener('deviceorientation', handleOrientation, true);
      } catch (err) {
        console.warn('DeviceOrientation indisponível:', err);
      }
    };

    start();

    return () => {
      enabled = false;
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);



  const [roomCurrent, setRoomCurrent] = useState(() => {
    const saved = localStorage.getItem('roomCurrent');
    return saved !== null ? JSON.parse(saved) : 0;
  });

  const [gameStats, setGameStats] = useState(() => {
    const saved = localStorage.getItem('gameStats');
    return saved !== null ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0, result: '' };
  });

  const [roomStars, setRoomStars] = useState(() => {
    const saved = localStorage.getItem('roomStars');
    return saved !== null ? JSON.parse(saved) : Array(100).fill(0);
  });
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  // Registry/Inventário do Player
  const [playerRegistry, setPlayerRegistry] = useState(() => {
    const saved = localStorage.getItem('playerRegistry');
    return saved !== null ? JSON.parse(saved) : {
      gold: 0,
      xp: 0,
      level: 1,
      currentSkins: {
        pedra: '/assets/1_pedra.png',
        papel: '/assets/2_papel.png',
        tesoura: '/assets/3_tesoura.png'
      },
      trailColor: 'white'
    };
  });

  useEffect(() => {
    localStorage.setItem('roomCurrent', JSON.stringify(roomCurrent));
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    localStorage.setItem('roomStars', JSON.stringify(roomStars));
    localStorage.setItem('playerRegistry', JSON.stringify(playerRegistry));
  }, [roomCurrent, gameStats, roomStars, playerRegistry]);

  const handleInit = () => {
    setScene('Init');
    //toggleFullScreen()
    backgroundMusic.current.play()
  }

  const rooms = useMemo(() => Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;

    // Reseta a curva de velocidade/spawn a cada 30 níveis
    const resetIndex = i % 5;

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
    
    return {
      id: level,
      gameDuration: 30 + resetIndex,
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      bulletsPerAction: 1,
      disableButton: i > roomCurrent,
      enemy: {
        common: { drop: (commonDrop / total) * 100 },
        uncommon: { drop: (uncommonDrop / total) * 100 },
        rare: { drop: (rareDrop / total) * 100 },
        heroic: { drop: (heroicDrop / total) * 100 },
        legendary: { drop: (legendaryDrop / total) * 100 },
        mythic: { drop: (mythicDrop / total) * 100 },
        immortal: { drop: (immortalDrop / total) * 100 }
      }
    };
  }), [roomCurrent]);

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  const handleGameEnd = (stats) => {
    let stars = 0;
    if (stats.result === 'win') {
      stars = player.hp >= 100 ? 3 : player.hp >= 50 ? 2 : 1;
      const newStars = [...roomStars];
      if (stars > newStars[activeRoomIndex]) {
        newStars[activeRoomIndex] = stars;
        setRoomStars(newStars);
      }
      if (activeRoomIndex === roomCurrent) {
        if (roomCurrent < rooms.length - 1) {
          setRoomCurrent(roomCurrent + 1);
        }
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
    
    }
    setGameStats({ ...stats, stars });
    setScene('EndResult');
  };

  const handleStartGame = (index) => {
    setPlayer(p => ({ ...p, hp: 10 })); // Reset player HP
    setEnemy(e => ({ ...e, hp: 10 })); // Reset enemy HP
    setActiveRoomIndex(index);
    setScene('Game');
  };

  const currentRoom = rooms[activeRoomIndex];

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
        rooms={rooms} 
        setRoomCurrent={handleStartGame} 
        roomStars={roomStars}
        playerRegistry={playerRegistry}
        setPlayerRegistry={setPlayerRegistry}
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
        enemyDropConfig={currentRoom.enemy}
      />
    ),
    EndResult: (
      <ResultScene gameStats={gameStats} setScene={setScene} />
    ),
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  
  return <div className='app-container'>
    <div className='game-screen' style={{
      backgroundImage: 'url(/assets/background/vila.gif)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${clamp(bgPos.x, 45, 55)}% ${clamp(bgPos.y, 45, 55)}%`,
      width: '100%',
      height: '100vh'
    }}>
      {stateScene[scene]}
    </div>
  </div>
}

export default App


