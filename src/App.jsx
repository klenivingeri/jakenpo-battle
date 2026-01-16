import { useState } from 'react'
import './App.css'
import { GameScene } from './components/Scene/GameScene'
import { InitScene } from './components/Scene/InitScene'



function App() {
  const [player, setPlayer] = useState({ hp: 100, atk: 10 });
  const [enemy, setEnemy] = useState({ hp: 100, atk: 10 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [scene, setScene] = useState('Init');
  const [roomCurrent, setRoomCurrent] = useState(0); // Highest UNLOCKED room index
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0, draws: 0, result: '' });
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  const rooms = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const baseSpeed = 2 + (i * 0.20);
    const baseSpawnInterval = Math.max(600, 3000 - (i * 100));

    return {
      id: level,
      gameDuration: 30 + (i * 2),
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      enemyAtk: 10 + Math.floor(i / 5) * 2,
      disableButton: i > roomCurrent,
    };
  });

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  const handleGameEnd = (stats) => {
    setGameStats(stats);
    if (stats.result === 'win' && activeRoomIndex === roomCurrent) {
        if (roomCurrent < rooms.length - 1) {
            setRoomCurrent(roomCurrent + 1);
        }
    }
    setScene('EndResult');
  };

  const handleStartGame = (index) => {
    setPlayer(p => ({ ...p, hp: 100 })); // Reset player HP
    setActiveRoomIndex(index);
    setScene('Game');
  };

  const currentRoom = rooms[activeRoomIndex];

  const stateScene = {
    Init: (
      <InitScene setScene={setScene} rooms={rooms} setRoomCurrent={handleStartGame} />
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
      <div>
        <h1>{gameStats.result === 'win' ? 'Você Venceu!' : 'Você Perdeu!'}</h1>
        <p>Vitórias (projéteis destruídos): {gameStats.wins}</p>
        <p>Derrotas (seus projéteis destruídos): {gameStats.losses}</p>
        <p>Empates: {gameStats.draws}</p>
        <button onClick={() => setScene('Init')}>
          Voltar para o menu
        </button>
      </div>
    ),
  };

  return stateScene[scene];
}

export default App
