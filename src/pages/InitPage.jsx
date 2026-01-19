import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InitScene } from '../components/Scene/InitScene';
import {
  getPlayerRegistry,
  getIsMusicOn,
  setIsMusicOn,
  getRoomCurrent,
  getRoomStars,
  saveToStorage,
  STORAGE_KEYS
} from '../utils/storageUtils';
import { calculateUnlockCost } from '../utils/economyUtils';
import { useMemo } from 'react';

function InitPage() {
  const navigate = useNavigate();
  const [isMusicOn, setIsMusicOnState] = useState(() => getIsMusicOn());
  const [roomCurrent, setRoomCurrent] = useState(() => getRoomCurrent());
  const [roomStars, setRoomStars] = useState(() => getRoomStars());
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());
  const [activeRoomIndex, setActiveRoomIndex] = useState(0);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ROOM_CURRENT, roomCurrent);
    saveToStorage(STORAGE_KEYS.ROOM_STARS, roomStars);
    saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, playerRegistry);
  }, [roomCurrent, roomStars, playerRegistry]);

  useEffect(() => {
    setIsMusicOn(isMusicOn);
  }, [isMusicOn]);

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

  const handleSetScene = (scene) => {
    if (scene === 'Start') {
      navigate('/');
    } else if (scene === 'Game') {
      navigate('/game', { state: { roomIndex: activeRoomIndex } });
    }
  };

  return (
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
      setIsMusicOn={setIsMusicOnState}
    />
  );
}

export default InitPage;
