import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import './Animate.css';
import { GameScene } from './components/Scene/GameScene';
import { InitScene } from './components/Scene/InitScene';
import { ResultScene } from './components/Scene/ResultScene';
import { toggleFullScreen } from './help/fullScreen';
import { calculateUnlockCost } from './utils/economyUtils';
import { generateRooms } from './utils/roomUtils';
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
  
  const handleSetScene = (sceneName, roomIndexOverride) => {
    if (sceneName === 'Game') {
      // Navega para a página de jogo passando o índice da room
      // Use o roomIndexOverride se fornecido, caso contrário use activeRoomIndex
      const indexToUse = roomIndexOverride !== undefined ? roomIndexOverride : activeRoomIndex;
      navigate('/game', { state: { roomIndex: indexToUse } });
    } else {
      setScene(sceneName);
    }
  };

  const rooms = useMemo(() => generateRooms(roomCurrent), [roomCurrent]);
  
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
    console.log('🏁 handleGameEnd chamado:', { stats, playerHP: player.hp, activeRoomIndex });
    
    let stars = 0;
    if (stats.result === 'win') {
      stars = player.hp >= 10 ? 3 : player.hp >= 5 ? 2 : 1;
      console.log('⭐ Calculando estrelas:', { playerHP: player.hp, stars });
      
      const newStars = [...roomStars];
      const oldStars = newStars[activeRoomIndex] || 0;
      
      console.log('⭐ Comparando estrelas:', { oldStars, newStars: stars, willUpdate: stars > oldStars });
      
      if (stars > newStars[activeRoomIndex]) {
        newStars[activeRoomIndex] = stars;
        setRoomStars(newStars);
        // Salva imediatamente no localStorage
        saveToStorage(STORAGE_KEYS.ROOM_STARS, newStars);
        console.log('⭐ Estrelas salvas:', { activeRoomIndex, stars, allStars: newStars });
      } else {
        console.log('⭐ Estrelas não atualizadas (já tinha melhor ou igual)');
      }
      // Removido o auto-desbloqueio - agora só desbloqueia comprando com gold
    } else {
      console.log('❌ Não foi vitória, resultado:', stats.result);
    }
    
    // Atualizar registry do player com gold e xp ganhos
    if (stats.gold > 0) {
      setPlayerRegistry(prev => {
        const newGold = prev.gold + stats.gold;
        const newXp = prev.xp + stats.gold * 10; // 10 XP por gold
        const newLevel = Math.floor(newXp / 100) + 1; // Nível a cada 100 XP
        
        const updatedRegistry = {
          ...prev,
          gold: newGold,
          xp: newXp,
          level: newLevel
        };
        
        // Salva imediatamente no localStorage
        saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, updatedRegistry);
        console.log('💰 Gold e XP salvos:', { gold: newGold, xp: newXp, level: newLevel });
        
        return updatedRegistry;
      });
    }
    
    const finalStats = { ...stats, stars };
    setGameStats(finalStats);
    saveToStorage(STORAGE_KEYS.GAME_STATS, finalStats);
    
    backgroundMusic.current.pause();
    setScene('EndResult');
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
        setScene={handleSetScene} 
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
        key={`game-${activeRoomIndex}`}
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


