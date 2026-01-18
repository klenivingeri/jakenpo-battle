import './Control.css'
import { HPBar } from '../../shared/HPBar'
import { ActionButton } from '../../shared/ActionButton'
import { useVibration } from '../../../hooks/useVibration'
import { BULLET_CONFIG, ALL_BULLET_TYPES } from '../../../constants/gameConfig'

export const Footer = ({ handleBullet, player, disableButtonPlayer }) => {
  const { vibrateClick } = useVibration()

  const handleBulletClick = (type) => {
    handleBullet(type, 'player')
  }

  return (
    <div className='container_control_hud'>
      <div className='container_hp_control_hud'>
        <HPBar 
          hp={player.hp} 
          maxHp={10} 
          showValue={true}
          hpClassName='hp_control_hud'
          ghostClassName='hp_ghost_control_hud'
        />
      </div>
      <div className='container_button_control_hud'>
        {ALL_BULLET_TYPES.map((type) => (
          <ActionButton
            key={type}
            type={type}
            label={BULLET_CONFIG[type].label}
            icon={BULLET_CONFIG[type].logo}
            onClick={handleBulletClick}
            disabled={disableButtonPlayer}
            onVibrate={vibrateClick}
          />
        ))}
      </div>
    </div>
  )
}