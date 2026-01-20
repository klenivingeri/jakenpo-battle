import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameScene } from '../components/Scene/GameScene';
import {
  getPlayerRegistry,
  getIsEconomyDebugOn,
  getRoomCurrent,
  getGameStats,
  getRoomStars,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/storageUtils';
import { calculateUnlockCost } from '../utils/economyUtils';
import { generateRooms } from '../utils/roomUtils';

function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const roomIndex = location.state?.roomIndex || 0;

  const [player, setPlayer] = useState({ hp: 10, atk: 1 });
  const [enemy, setEnemy] = useState({ hp: 10, atk: 1 });
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false);
  const [isEconomyDebugOn] = useState(() => getIsEconomyDebugOn());
  const [roomCurrent, setRoomCurrent] = useState(() => getRoomCurrent());
  const [gameStats, setGameStats] = useState(() => getGameStats());
  const [roomStars, setRoomStars] = useState(() => getRoomStars());
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // Estado do multiplicador de velocidade

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

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOM_CURRENT, roomCurrent);
    saveToStorage(STORAGE_KEYS.GAME_STATS, gameStats);
    saveToStorage(STORAGE_KEYS.ROOM_STARS, roomStars);
    saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, playerRegistry);
  }, [roomCurrent, gameStats, roomStars, playerRegistry]);

  const rooms = useMemo(() => generateRooms(roomCurrent), [roomCurrent]);

  const roomsWithCosts = useMemo(() => {
    return rooms.map((room) => {
      const unlockCost = calculateUnlockCost(room.id, room);
      return { ...room, unlockCost };
    });
  }, [rooms]);

  const currentRoom = roomsWithCosts[roomIndex];

  // Debug: Log da configuração da room atual
  useEffect(() => {
    console.log('🎮 Room Index:', roomIndex);
    console.log('🎮 Current Room Config COMPLETA:', {
      id: currentRoom.id,
      level: roomIndex + 1,
      gameDuration: currentRoom.gameDuration,
      speed: currentRoom.speed,
      spawnInterval: currentRoom.spawnInterval,
      bulletsPerAction: currentRoom.bulletsPerAction,
      unlockCost: currentRoom.unlockCost,
      enemy: currentRoom.enemy
    });
    console.log('📊 Resumo:', `Duração: ${currentRoom.gameDuration}s | Velocidade: ${currentRoom.speed.toFixed(2)} | Spawn: ${(currentRoom.spawnInterval/1000).toFixed(2)}s`);
  }, [roomIndex, currentRoom]);

  const handleBullet = (type, shooter) => {
    if (shooter === 'player') {
      setPlayer(prev => ({ ...prev, bulletType: type }));
    }
  };

  // Callback para mudança de velocidade
  const handleSpeedChange = (newSpeed) => {
    setSpeedMultiplier(newSpeed);
  };

  const handleGameEnd = (stats) => {
    console.log('🏁 handleGameEnd chamado:', { stats, playerHP: player.hp, roomIndex });
    
    let stars = 0;
    if (stats.result === 'win') {
      stars = player.hp >= 10 ? 3 : player.hp >= 5 ? 2 : 1;
      console.log('⭐ Calculando estrelas:', { playerHP: player.hp, stars });
      
      const newStars = [...roomStars];
      const oldStars = newStars[roomIndex] || 0;
      
      console.log('⭐ Comparando estrelas:', { oldStars, newStars: stars, willUpdate: stars > oldStars });
      
      if (stars > newStars[roomIndex]) {
        newStars[roomIndex] = stars;
        setRoomStars(newStars);
        // Salva imediatamente no localStorage
        saveToStorage(STORAGE_KEYS.ROOM_STARS, newStars);
        console.log('⭐ Estrelas salvas:', { roomIndex, stars, allStars: newStars });
      } else {
        console.log('⭐ Estrelas não atualizadas (já tinha melhor ou igual)');
      }
    } else {
      console.log('❌ Não foi vitória, resultado:', stats.result);
    }
    
    if (stats.gold > 0) {
      setPlayerRegistry(prev => {
        const newGold = prev.gold + stats.gold;
        const newXp = prev.xp + stats.gold * 2;
        const newLevel = Math.floor(newXp / 100) + 1;
        
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
    navigate('/result', { state: { stats: finalStats } });
  };

  return (
    <GameScene
      key={`game-${roomIndex}`}
      handleBullet={handleBullet}
      player={player}
      setPlayer={setPlayer}
      enemy={{ ...enemy, atk: 1 }}
      setEnemy={setEnemy}
      disableButtonPlayer={disableButtonPlayer}
      setdisableButtonPlayer={setdisableButtonPlayer}
      handleGameEnd={handleGameEnd}
      gameDuration={currentRoom.gameDuration}
      speed={currentRoom.speed}
      spawnInterval={currentRoom.spawnInterval}
      bulletsPerSpawn={currentRoom.bulletsPerAction}
      roomLevel={currentRoom.id}
      enemyDropConfig={currentRoom.enemy}
      isEconomyDebugOn={isEconomyDebugOn}
      speedMultiplier={speedMultiplier}
      onSpeedChange={handleSpeedChange}
    />
  );
}

export default GamePage;
