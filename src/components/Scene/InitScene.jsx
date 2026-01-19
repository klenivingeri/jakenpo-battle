import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../shared/Modal';
import { PurchaseModal } from '../shared/PurchaseModal';
import { Footer } from '../Footer';
import { getEquippedSkills, getPlayerRegistry, getIsEconomyDebugOn, setIsEconomyDebugOn } from '../../utils/storageUtils';
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
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEconomyDebugOn, setIsEconomyDebugOnState] = useState(() => getIsEconomyDebugOn());

  // Estado local para as skills equipadas
  const [equippedSkills, setEquippedSkills] = useState(() => getEquippedSkills());

  // Atualiza as skills quando houver mudanças na loja
  useEffect(() => {
    const handleSkillsChanged = () => {
      const registry = getPlayerRegistry();
      setEquippedSkills(registry.equippedSkills);
      setPlayerRegistry(prev => ({
        ...prev,
        equippedSkills: registry.equippedSkills,
        ownedSkills: registry.ownedSkills,
        gold: registry.gold
      }));
    };

    window.addEventListener('skillsChanged', handleSkillsChanged);
    window.addEventListener('backgroundChanged', handleSkillsChanged);

    return () => {
      window.removeEventListener('skillsChanged', handleSkillsChanged);
      window.removeEventListener('backgroundChanged', handleSkillsChanged);
    };
  }, [setPlayerRegistry]);

  // Sincronizar estado de economy debug com localStorage
  useEffect(() => {
    setIsEconomyDebugOn(isEconomyDebugOn);
  }, [isEconomyDebugOn]);

  // Wrapper para atualizar o estado e forçar re-render
  const handleEconomyDebugChange = (value) => {
    setIsEconomyDebugOnState(value);
    setIsEconomyDebugOn(value);
    // Força atualização da interface
    window.dispatchEvent(new Event('economyDebugChanged'));
  };

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
      // Próxima fase - sempre abre modal de compra para mostrar requisitos
      setSelectedRoom(room);
      setIsPurchaseModalOpen(true);
    }
    // Fases futuras não fazem nada (disabled)
  };

  return (
    <div className="container_game_scene" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header Top Bar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Level e XP */}
        <LevelBox level={playerRegistry.level} xp={playerRegistry.xp} />
        
        {/* Moedas */}
        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'center' }}>
          <InfoBox>
            <strong style={{ fontSize: '1.4rem' }}>🪙</strong> {playerRegistry.gold}
          </InfoBox>
          <InfoBox>
            <strong style={{ fontSize: '1.4rem' }}>💎</strong> 0
          </InfoBox>
        </div>

        {/* Botão Config */}
        <button
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.4rem',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onClick={() => setIsModalOpen(true)}
        >
          ⚙️
        </button>
      </div>

      {/* Skills Bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
      }}>
        {/* Skills Equipadas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '2px solid rgba(255,255,255,0.2)',
          flex: 1,
        }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            borderRadius: '6px', 
            padding: '4px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={equippedSkills.pedra} 
              alt="pedra" 
              style={{ 
                width: '28px', 
                height: '28px', 
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }} 
            />
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            borderRadius: '6px', 
            padding: '4px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={equippedSkills.papel} 
              alt="papel" 
              style={{ 
                width: '28px', 
                height: '28px', 
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }} 
            />
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.25)', 
            borderRadius: '6px', 
            padding: '4px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={equippedSkills.tesoura} 
              alt="tesoura" 
              style={{ 
                width: '28px', 
                height: '28px', 
                display: 'block',
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }} 
            />
          </div>
        </div>

        {/* Botões de Navegação */}
        <button 
          className='button_footer botao-pulsar' 
          onClick={() => navigate('/galeria')}
          style={{
            padding: '8px 12px',
            minWidth: '44px',
            height: '44px',
            fontSize: '1.3rem',
          }}
        >
          🖼️
        </button>
        <button 
          className='button_footer botao-pulsar' 
          onClick={() => navigate('/loja')}
          style={{
            padding: '8px 12px',
            minWidth: '44px',
            height: '44px',
            fontSize: '1.3rem',
          }}
        >
          🛒
        </button>
      </div>

      {/* Main Content - Grid de Fases */}
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
        isEconomyDebugOn={isEconomyDebugOn}
        setIsEconomyDebugOn={handleEconomyDebugChange}
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
        roomStars={roomStars}
      />
    </div>
  );
};
