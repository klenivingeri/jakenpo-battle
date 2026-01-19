import './Header.css'
import { HPBar } from '../../shared/HPBar'

export const Header = ({ enemy, isInfiniteMode, isChaosMode, currentPhase, totalTime, timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='container_header_hud'>
      {!isInfiniteMode && !isChaosMode && (
        <div className='container_hp_header_hud'>
          <HPBar 
            hp={enemy.hp} 
            maxHp={10} 
            showValue={false}
            hpClassName='hp_header_hud'
            ghostClassName='hp_ghost_header_hud'
          />
        </div>
      )}
    </div>
  )
}
