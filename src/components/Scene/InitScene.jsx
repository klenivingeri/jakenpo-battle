import { Footer } from '../Footer'
import './GameScene.css'
import { useEffect, useState } from 'react';

export const InitScene = ({ rooms, setRoomCurrent, setScene, roomStars }) => {
  const [visibleRooms, setVisibleRooms] = useState([]);

  useEffect(() => {
    let timeouts = [];

    rooms.forEach((_, index) => {
      const t = setTimeout(() => {
        setVisibleRooms(prev => [...prev, index]);
      }, index * 35); // intervalo entre rooms

      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [rooms]);

  return (
    <div className='container_game_scene'>
      <div style={{ flex: 1, overflowY: 'auto', height:'100%' }}>
        <div className='init_container_grid'>

          {rooms.map((room, index) => {
            const isVisible = visibleRooms.includes(index);

            return (
              <button
                key={room.id}
                disabled={!isVisible || room.disableButton}
                className={`init_item_grid init_button_footer ${
                  isVisible ? 'botao-chegada' : ''
                }`}
                style={{
                  visibility: isVisible ? 'visible' : 'hidden'
                }}
                onClick={() => {
                  if (!isVisible) return;
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
