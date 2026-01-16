import { useState, useEffect } from 'react';
import './App.css';
import { GameScene } from './components/Scene/GameScene';
import { InitScene } from './components/Scene/InitScene';

// Função utilitária para facilitar
const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

function App() {
  const [player, setPlayer] = useState({ hp: 100, atk: 10 });
  const [enemy, setEnemy] = useState({ hp: 100, atk: 10 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [scene, setScene] = useState('Init');

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

  useEffect(() => {
    localStorage.setItem('roomCurrent', JSON.stringify(roomCurrent));
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    localStorage.setItem('roomStars', JSON.stringify(roomStars));
  }, [roomCurrent, gameStats, roomStars]);


  const rooms = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const baseSpeed = 2 + (i * 0.20);
    const baseSpawnInterval = Math.max(600, 3000 - (i * 100));
    return {
      id: level,
      gameDuration: 30 + (i * 2),
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      enemyAtk: 10, // Math.floor(i / 5) * 2,
      enemyHp: 100, // enemyHp: 100 + i * 10,
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
      />
    ),
    EndResult: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center',
        width: '100%',
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid black',
          width: '100%',
          height: '100%'
        }}>
          <div >
                        {gameStats.result === 'win' && (
              <div>
                {Array.from({ length: gameStats.stars }).map((_, i) => (
                  <span key={i} style={{ fontSize: '3rem' }}>⭐</span>
                ))}
              </div>
            )}
            <h1 className='' style={{ fontSize: '3rem' }}>{gameStats.result === 'win' ? 'Você Venceu!' : 'Você Perdeu!'}</h1>
            <h3 className=''>Durante a Batalha</h3>
            <p>Vitórias: {gameStats.wins}</p>
            <p>Derrotas: {gameStats.losses}</p>
            <p>Empates: {gameStats.draws}</p>
            <button className='button_footer' style={{padding: '10px', marginTop: '20px', fontSize: '1rem'}} onClick={() => setScene('Init')}>
              Voltar para o menu
            </button>
          </div>
        </div>
      </div>
    ),
  };

  return <div className='app-container'>
    <div className='game-screen'>
      {stateScene[scene]}
    </div>
  </div>
}

export default App
