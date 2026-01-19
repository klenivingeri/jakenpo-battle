import { useState, useEffect, useMemo } from 'react';
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
import { generateRooms } from '../utils/roomUtils';

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

  const rooms = useMemo(() => generateRooms(roomCurrent), [roomCurrent]);

  const roomsWithCosts = useMemo(() => {
    return rooms.map((room) => {
      const unlockCost = calculateUnlockCost(room.id, room);
      return { ...room, unlockCost };
    });
  }, [rooms]);

  const handleSetScene = (scene, roomIndexOverride) => {
    if (scene === 'Start') {
      navigate('/');
    } else if (scene === 'Game') {
      // Use o roomIndexOverride se fornecido, caso contrário use activeRoomIndex
      const indexToUse = roomIndexOverride !== undefined ? roomIndexOverride : activeRoomIndex;
      console.log('🚀 Navegando para /game com roomIndex:', indexToUse);
      navigate('/game', { state: { roomIndex: indexToUse } });
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
