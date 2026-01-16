import { useState } from 'react'
import './App.css'
import { GameScene } from './components/Scene/GameScene'
import { InitScene } from './components/Scene/InitScene'



function App() {
  const [player, setPlayer] = useState({ hp: 100, atk: 10 })
  const [enemy, setEnemy] = useState({ hp: 100, atk: 10  })
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false)
  const [scene, setScene] = useState('Init')
  const [roomCurrent, setRoomCurrent] = useState(0)
  const [gameStats, setGameStats] = useState({ wins: 0, losses: 0, draws: 0, result: '' });
  

const rooms = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  
  return {
    id: level,
    
    // Duração: Começa com 30s e aumenta 2s por nível (ou diminui, se preferir mais pressão)
    gameDuration: 30 + (i * 2), 
    
    // Velocidade: Base de 2 (lento) + incremento gradual. 
    // Usamos (i * 0.2) para não subir de 1 em 1, o que seria rápido demais.
    speed: 2 + (i * 0.25), 
    
    // Dano do Inimigo: Pode aumentar a cada 10 níveis
    enemyAtk: 10 + Math.floor(i / 10) * 5,

    // Bloqueio: Se o ID da sala for maior que o nível atual, fica desativado
    disableButton: level > roomCurrent 
  };
});

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  }

  const handleGameEnd = (stats) => {
    setGameStats(stats);
    setScene('EndResult');
  }

  const stateScene = {
    Init: (
    <InitScene setScene={setScene} rooms={rooms} setRoomCurrent={setRoomCurrent}></InitScene>
  ),
    Game: (
    <GameScene 
      handleBullet={handleBullet} 
      player={player} 
      setPlayer={setPlayer}
      enemy={enemy} 
      setEnemy={setEnemy}
      disableButtonPlayer={disableButtonPlayer} 
      setdisableButtonPlayer={setdisableButtonPlayer}
      setScene={setScene}
      handleGameEnd={handleGameEnd}
      gameDuraction={rooms[roomCurrent].gameDuraction}
    />
  ),
    EndResult: (
    <div>
      <h1>{gameStats.result === 'win' ? 'Você Venceu!' : 'Você Perdeu!'}</h1>
      <p>Vitórias (projéteis destruídos): {gameStats.wins}</p>
      <p>Derrotas (seus projéteis destruídos): {gameStats.losses}</p>
      <p>Empates: {gameStats.draws}</p>
      <button onClick={() => {
        setScene('Init')
        setRoomCurrent(roomCurrent+1)
      }}>Voltar para o menu</button>
    </div>
  )
  }

  return stateScene[scene]
}

export default App
