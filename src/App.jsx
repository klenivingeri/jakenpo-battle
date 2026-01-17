import { useState, useEffect, useRef } from 'react';
import './App.css';
import './Animate.css';
import { GameScene } from './components/Scene/GameScene';
import { InitScene } from './components/Scene/InitScene';
import { ResultScene } from './components/Scene/ResultScene';
import { toggleFullScreen } from './help/fullScreen';

// Função utilitária para facilitar
const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

function App() {
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  const [player, setPlayer] = useState({ hp: 100, atk: 10 });
  const [enemy, setEnemy] = useState({ hp: 100, atk: 10 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [scene, setScene] = useState('Start');


useEffect(() => {
  // ⛔ ambiente sem window (SSR / build)
  if (typeof window === 'undefined') return;

  // ⛔ API não existe
  if (!('DeviceOrientationEvent' in window)) {
    console.log('DeviceOrientation não suportado');
    return;
  }

  let rafId = null;
  let enabled = true;

  const handleOrientation = (event) => {
    if (!enabled || rafId) return;

    rafId = requestAnimationFrame(() => {
      // alguns devices retornam null
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
      // iOS (precisa permissão explícita)
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

  const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));

  useEffect(() => {
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.07; // Volume 20

    return () => {
      backgroundMusic.current.pause();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('roomCurrent', JSON.stringify(roomCurrent));
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    localStorage.setItem('roomStars', JSON.stringify(roomStars));
  }, [roomCurrent, gameStats, roomStars]);

  const handleInit = () => {
    setScene('Init');
    //toggleFullScreen()
    backgroundMusic.current.play()
  }

  const rooms = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;

    // Reseta a curva de velocidade/spawn a cada 30 níveis
    const resetIndex = i % 35;

    // Velocidade: sobe de 2.0 a 7.6 dentro de cada bloco de 30 níveis
    const baseSpeed = 2 + (Math.floor(resetIndex / 2) * 0.40);

    // Spawn: fica mais rápido até o meio de cada bloco
    const baseSpawnInterval = Math.max(600, 3000 - (Math.min(resetIndex, 15) * 100));

    // LÓGICA DE MULTIPLIER (Quantidade de balas)
    // i < 29: Níveis 1-29 -> 1 bala, 
    // i < 59: Níveis 30-59 -> 2 balas um bullet atras do outro
    // i >= 59: Níveis 60+ -> 3 balas  um bullet atras do outro
    let bulletsPerSpawn = 1;
    if (i >= 29 && i < 59) bulletsPerSpawn = 2;
    else if (i >= 59) bulletsPerSpawn = 3;

    return {
      id: level,
      gameDuration: 30 + resetIndex,
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      bulletsPerAction: bulletsPerSpawn, // Nova propriedade!
      enemyAtk: 10,
      enemyHp: 100,
      disableButton: i > roomCurrent,
    };
  });

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
    }
    setGameStats({ ...stats, stars });
    setScene('EndResult');
  };

  const handleStartGame = (index) => {
    setPlayer(p => ({ ...p, hp: 100 })); // Reset player HP
    setEnemy(e => ({ ...e, hp: rooms[index].enemyHp })); // Reset enemy HP
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
      <InitScene setScene={setScene} rooms={rooms} setRoomCurrent={handleStartGame} roomStars={roomStars} />
    ),
    Game: (
      <GameScene
        handleBullet={handleBullet}
        player={player}
        setPlayer={setPlayer}
        enemy={{ ...enemy, atk: currentRoom.enemyAtk }}
        setEnemy={setEnemy}
        disableButtonPlayer={disableButtonPlayer}
        setdisableButtonPlayer={setdisableButtonPlayer}
        setScene={setScene}
        handleGameEnd={handleGameEnd}
        gameDuration={currentRoom.gameDuration}
        speed={currentRoom.speed}
        spawnInterval={currentRoom.spawnInterval}
        bulletsPerSpawn={currentRoom.bulletsPerAction}
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
      backgroundPosition: `${clamp(bgPos.x, 45, 55)}% ${clamp(bgPos.y, 45, 55)}%
      width: '100%',
      height: '100vh'
    }}>
      {stateScene[scene]}
    </div>
  </div>
}

export default App


