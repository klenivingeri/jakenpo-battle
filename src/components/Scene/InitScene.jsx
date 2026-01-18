import { useState } from 'react';
import Modal from '../shared/Modal';
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

export const InitScene = ({ rooms, setRoomCurrent, setScene, roomStars, playerRegistry, setPlayerRegistry, setIsMusicOn, isMusicOn }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            return (
              <button
                key={room.id}
                disabled={room.disableButton}
                className={
                  'init_item_grid init_button_footer botao-chegada'
                }
                onClick={() => {
                  setRoomCurrent(index);
                  setScene('Game');
                }}
              >
                <div>{room.id}</div>

                <div style={{ fontSize: '0.8rem' }}>
                  {Array.from({ length: roomStars[index] }).map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
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
    </div>
  );
};
