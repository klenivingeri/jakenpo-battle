import './Control.css'
import { HPBar } from '../../shared/HPBar'
import { ActionButton } from '../../shared/ActionButton'
import { useVibration } from '../../../hooks/useVibration'
import { BULLET_CONFIG, ALL_BULLET_TYPES } from '../../../constants/gameConfig'
import { useEffect, useState } from 'react'

export const Footer = ({ handleBullet, player, disableButtonPlayer, roomLevel, onSpeedChange, isSpecialMode = false }) => {
  const { vibrateClick } = useVibration()
  const [currentSpeed, setCurrentSpeed] = useState(1)

  const handleBulletClick = (type) => {
    handleBullet(type, 'player')
  }

  const adjustSpeed = (direction) => {
    let newSpeed = currentSpeed
    if (direction === 'up' && currentSpeed < 3) {
      newSpeed += 0.1
    } else if (direction === 'down' && currentSpeed > 0.5) {
      newSpeed -= 0.1
    }
    setCurrentSpeed(newSpeed)
    if (onSpeedChange) {
      onSpeedChange(newSpeed)
    }
  }

  // Adiciona listeners para as teclas Q, W, E
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Previne ação se os botões estão desabilitados
      if (disableButtonPlayer) return

      const key = event.key.toLowerCase()

      switch (key) {
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
        {!isSpecialMode && (
          <div style={{ position: 'absolute', right: '10px', bottom: '24px' }}>
            <div className='speed_selector_horizontal'>
              <button className='speed_button' onClick={() => adjustSpeed('down')}>
                ◄
              </button>
              <div className='speed_display'>{currentSpeed.toFixed(1)}x</div>
              <button className='speed_button' onClick={() => adjustSpeed('up')}>
                ►
              </button>
            </div>
          </div>
        )}
        <HPBar
          hp={player.hp}
          maxHp={10}
          showValue={true}
          hpClassName='hp_control_hud'
          ghostClassName='hp_ghost_control_hud'
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-end' }}>
        <div className='container_button_control_hud' style={{ flex: 1 }}>
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
    </div>
  )
}