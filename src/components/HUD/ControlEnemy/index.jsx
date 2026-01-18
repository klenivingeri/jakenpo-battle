import './Header.css'
import { HPBar } from '../../shared/HPBar'

export const Header = ({ enemy }) => {
  return (
    <div className='container_header_hud'>
      <div className='container_hp_header_hud'>
        <HPBar 
          hp={enemy.hp} 
          maxHp={10} 
          showValue={false}
          hpClassName='hp_header_hud'
          ghostClassName='hp_ghost_header_hud'
        />
      </div>
    </div>
  )
}
