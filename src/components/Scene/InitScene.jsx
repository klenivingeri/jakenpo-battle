import { Footer } from '../Footer'
import './GameScene.css'
import { useEffect, useState } from 'react';

export const InitScene = ({ rooms, setRoomCurrent, setScene, roomStars }) => {

  return (
    <div className='container_game_scene'>
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
