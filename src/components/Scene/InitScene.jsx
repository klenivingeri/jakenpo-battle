import { useState } from 'react';
import Modal from '../shared/Modal';
import { PurchaseModal } from '../shared/PurchaseModal';
import { Footer } from '../Footer';
import './GameScene.css';


const StyledImage = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    style={{ width: '25px', height: '24px' }}
  />
);

const InfoBox = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      height: '36px',
      padding: '5px 10px 5px 5px',
      borderRadius: '5px',
    }}
  >
    {children}
  </div>
);

const LevelBox = ({ level, xp }) => (
  <InfoBox>
    <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <span style={{ fontSize: '1.6rem' }}>⭐</span>
      <span
        style={{
          position: 'absolute',
          zIndex: 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {level}
      </span>
    </strong>{' '}
    {xp} / {level * 100}
  </InfoBox>
);

export const InitScene = ({ rooms, setRoomCurrent, setActiveRoomIndex, setScene, roomStars, playerRegistry, setPlayerRegistry, setIsMusicOn, isMusicOn, roomCurrent }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Função para lidar com a compra de uma fase
  const handlePurchase = (room) => {
    if (playerRegistry.gold >= room.unlockCost) {
      const roomIndex = room.id - 1; // room.id é 1-based, roomCurrent é 0-based
      
      // Desconta o gold
      setPlayerRegistry(prev => ({
        ...prev,
        gold: prev.gold - room.unlockCost
      }));
      
      // Desbloqueia a fase (atualiza roomCurrent)
      setRoomCurrent(roomIndex);
      
      // Define a fase ativa
      setActiveRoomIndex(roomIndex);
      
      // Fecha o modal
      setIsPurchaseModalOpen(false);
      setSelectedRoom(null);
      
      // Inicia a fase automaticamente
      setScene('Game');
    }
  };

  // Função para lidar com o clique em uma fase
  const handleRoomClick = (room, index) => {
    const isUnlocked = index <= roomCurrent;
    const isNextRoom = index === roomCurrent + 1;
    
    if (isUnlocked) {
      // Fase já desbloqueada - pode jogar
      setActiveRoomIndex(index);
      setScene('Game');
    } else if (isNextRoom) {
      // Próxima fase - abre modal de compra
      setSelectedRoom(room);
      setIsPurchaseModalOpen(true);
    }
    // Fases futuras não fazem nada (disabled)
  };

  return (
    <div className="container_game_scene">
      {/* Barra de informações do jogador */}
      <div
        style={{
          top: 0,
          left: 0,
          width: '100%',
          color: 'white',
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          zIndex: 10,
          boxSizing: 'border-box',
        }}
      >
        <InfoBox>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <StyledImage src={playerRegistry.currentSkins.pedra} alt="pedra" />
          <StyledImage src={playerRegistry.currentSkins.papel} alt="papel" />
          <StyledImage src={playerRegistry.currentSkins.tesoura} alt="tesoura" />
          </div>
        </InfoBox>
        <LevelBox level={playerRegistry.level} xp={playerRegistry.xp} />
        <InfoBox>
          <strong style={{ fontSize: '1.6rem' }}>🪙</strong> {playerRegistry.gold}
        </InfoBox>
        <InfoBox>
          <strong style={{ fontSize: '1.6rem' }}>💎</strong> 0
        </InfoBox>
        {/* Menu para desligar música e ativar dark mode */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
            onClick={() => setIsModalOpen(true)}
          >
            ⚙️
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
        <div className="init_container_grid">
          {rooms.map((room, index) => {
            const isUnlocked = index <= roomCurrent;
            const isNextRoom = index === roomCurrent + 1;
            const isFutureRoom = index > roomCurrent + 1;

            return (
              <button
                key={room.id}
                disabled={isFutureRoom}
                className={
                  'init_item_grid init_button_footer botao-chegada'
                }
                style={{
                  position: 'relative',
                  opacity: isFutureRoom ? 0.5 : 1,
                  cursor: isFutureRoom ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleRoomClick(room, index)}
              >
                {/* Ícone de cadeado para próxima fase */}
                {isNextRoom && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    fontSize: '1.2rem',
                    filter: 'drop-shadow(0 0 4px rgba(241, 196, 15, 0.8))'
                  }}>
                    🔒
                  </div>
                )}

                <div>{room.id}</div>

                <div style={{ fontSize: '0.8rem' }}>
                  {isUnlocked ? (
                    Array.from({ length: roomStars[index] || 0 }).map((_, i) => (
                      <span key={i}>⭐</span>
                    ))
                  ) : isNextRoom ? (
                    <span style={{ color: 'black', fontSize: '0.7rem' }}>
                      🪙 {room.unlockCost}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <Footer setScene={setScene} />

      {/* Modal customizado para configurações */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isMusicOn={isMusicOn}
        setIsMusicOn={setIsMusicOn}
      />

      {/* Modal de compra de fase */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => {
          setIsPurchaseModalOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        playerGold={playerRegistry.gold}
        onPurchase={handlePurchase}
      />
    </div>
  );
};
