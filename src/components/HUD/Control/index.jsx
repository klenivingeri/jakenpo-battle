import './Control.css'
import { HPBar } from '../../shared/HPBar'
import { ActionButton } from '../../shared/ActionButton'
import { useVibration } from '../../../hooks/useVibration'
import { BULLET_CONFIG, ALL_BULLET_TYPES } from '../../../constants/gameConfig'
import { useEffect } from 'react'

export const Footer = ({ handleBullet, player, disableButtonPlayer }) => {
  const { vibrateClick } = useVibration()

  const handleBulletClick = (type) => {
    handleBullet(type, 'player')
  }

  // Adiciona listeners para as teclas Q, W, E
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Previne ação se os botões estão desabilitados
      if (disableButtonPlayer) return

      const key = event.key.toLowerCase()
      
      switch(key) {
        case 'q':
          handleBulletClick('pedra')
          vibrateClick()
          break
        case 'w':
          handleBulletClick('papel')
          vibrateClick()
          break
        case 'e':
          handleBulletClick('tesoura')
          vibrateClick()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [disableButtonPlayer, vibrateClick])

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