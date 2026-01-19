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

  const backgroundMusic = useRef(new Audio('/assets/song/song-background.mp3'));

  useEffect(() => {
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.05;
    backgroundMusic.current.play().catch(e => console.log('Audio play failed:', e));

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

  const rooms = useMemo(() => Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const resetIndex = i % 30;

    const baseSpeed = 2 + (Math.floor(resetIndex / 2) * 0.40);
    const baseSpawnInterval = Math.max(600, 3000 - (Math.min(resetIndex, 20) * 100));

    const progressFactor = Math.min(i / 99, 1);
    
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
      disableButton: i > roomCurrent,
      enemy: enemyConfig
    };
  }), [roomCurrent]);

  const roomsWithCosts = useMemo(() => {
    return rooms.map((room) => {
      const unlockCost = calculateUnlockCost(room.id, room);
      return { ...room, unlockCost };
    });
  }, [rooms]);

  const currentRoom = roomsWithCosts[roomIndex];

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
      if (stars > newStars[roomIndex]) {
        newStars[roomIndex] = stars;
        setRoomStars(newStars);
      }
    }
    
    if (stats.gold > 0) {
      setPlayerRegistry(prev => {
        const newGold = prev.gold + stats.gold;
        const newXp = prev.xp + stats.gold * 10;
        const newLevel = Math.floor(newXp / 100) + 1;
        
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
    navigate('/result', { state: { stats: { ...stats, stars } } });
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
    />
  );
}

export default GamePage;
