import { Footer } from '../Footer'
import './GameScene.css'


export const InitScene = ({ rooms, setRoomCurrent, setScene, roomStars }) => {
  return (
    <div className='container_game_scene'>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className='init_container_grid'>

          {rooms.map((room, index) =>
            <button key={room?.id} disabled={room.disableButton} className='init_item_grid init_button_footer' onClick={() => {
              setRoomCurrent(index);
              setScene('Game');
              //estrela aqui, só em fases ele já passou
            }}>
              <div>{room?.id}</div>
              <div>
                {Array.from({ length: roomStars[index] }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
            </button>
          )}
        </div>
      </div>
      <Footer setScene={setScene} />
    </div>
  )
}