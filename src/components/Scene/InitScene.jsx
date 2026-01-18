import { Footer } from '../Footer'
import './GameScene.css'
import { useEffect, useState } from 'react';

export const InitScene = ({ rooms, setRoomCurrent, setScene, roomStars, playerRegistry, setPlayerRegistry }) => {

  return (
    <div className='container_game_scene'>
      {/* Registry/Inventário do Player */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 10,
        fontSize: '0.9rem'
      }}>
        <div><strong>Inventário</strong></div>
        <div>Gold: {playerRegistry.gold}</div>
        <div>XP: {playerRegistry.xp}</div>
        <div>Level: {playerRegistry.level}</div>
        <div style={{ marginTop: '5px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span>Skins:</span>
          <img src={playerRegistry.currentSkins.pedra} alt="pedra" style={{ width: '20px', height: '20px' }} />
          <img src={playerRegistry.currentSkins.papel} alt="papel" style={{ width: '20px', height: '20px' }} />
          <img src={playerRegistry.currentSkins.tesoura} alt="tesoura" style={{ width: '20px', height: '20px' }} />
        </div>
        <div style={{ marginTop: '5px' }}>
          Rastro: <span style={{ color: playerRegistry.trailColor, fontWeight: 'bold' }}>●</span> {playerRegistry.trailColor}
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', height:'100%' }}>
        <div className='init_container_grid'>

          {rooms.map((room, index) => {
            return (
              <button
                key={room.id}
                disabled={room.disableButton}
                className={'init_item_grid init_button_footer botao-chegada'}
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
    </div>
  );
};
