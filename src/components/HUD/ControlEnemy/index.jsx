import './Header.css'

export const Header = ({ enemy }) => {
  return (
    <div className='container_header_hud'>
      <div className='container_hp_header_hud'>
        <div className='hp_header_hud' style={{ width: `${enemy.hp}%` }}></div>
        <div className='hp_ghost_header_hud'></div>
      </div>
    </div>
  )
}
