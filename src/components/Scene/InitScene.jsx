import { Footer } from '../Footer'
import './GameScene.css'


export const InitScene = ({rooms, setRoomCurrent, setScene}) => {
  
  return (
    <div className='container_game_scene'>
      <div className='init_container_grid'>
        {
        rooms.map((room, index) => 
        <button key={room?.id} disabled={room.disableButton} className='init_item_grid init_button_footer' onClick={() => {
          setRoomCurrent(index);
          setScene('Game');
        }}>
          {room?.id}
        </button>)}
      </div>
    </div>
  )
}