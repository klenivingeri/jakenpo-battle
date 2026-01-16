import './Header.css'

export const Header = ({enemy}) => {
  return (
    <div className='container_header'>
      <div className='container_hp_header'>
        <div className='hp_header' style={{ width: `${enemy.hp}%` }}></div>
        <div className='hp_ghost_header'></div>
      </div>
    </div>
  )
}