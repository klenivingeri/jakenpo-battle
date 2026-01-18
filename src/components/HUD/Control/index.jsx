import './Control.css'

// Função utilitária para facilitar
const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const Footer = ({ handleBullet, player, disableButtonPlayer }) => {

  const handleTouchStart = (e) => {
    if (e.currentTarget.disabled) return;
    e.currentTarget.classList.add('pressed');
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.classList.remove('pressed');
  };

  return (
    <div className='container_control_hud'>
      <div className='container_hp_control_hud'>
        <div className='hp_control_hud' style={{ width: `${player.hp * 10}%` }}>{player.hp * 10}</div>
        <div className='hp_ghost_control_hud'></div>
      </div>
      <div className='container_button_control_hud'>
        <button
          className='button_control_hud'
          disabled={disableButtonPlayer}
          onClick={() => {
            vibrate(10); // Apenas um "clique" mecânico leve
            handleBullet('pedra', 'player');
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/** <span className='emoji_footer'>🗿</span> */}
          <img src="/assets/1_pedra_logo.png" height={30}></img>
          <span>Pedra</span>
        </button>
        <button
          className='button_control_hud'
          disabled={disableButtonPlayer}
          onClick={() => {
            vibrate(10); // Apenas um "clique" mecânico leve
            handleBullet('papel', 'player');
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/**<span className='emoji_footer'>📄</span> */}
          <img src="/assets/2_papel_logo.png" height={30}></img>
          <span>Papel</span>
        </button>
        <button
          className='button_control_hud'
          disabled={disableButtonPlayer}
          onClick={() => {
            vibrate(10); // Apenas um "clique" mecânico leve
            handleBullet('tesoura', 'player');
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/**<span className='emoji_footer'>✂️</span> */}
          <img src="/assets/3_tesoura_logo.png" height={30}></img>
          <span>Tesoura</span>
        </button>
      </div>
    </div>
  )
}