import './Control.css'

// Função utilitária para facilitar
const vibrate = (pattern = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const Footer = ({ handleBullet, player, disableButtonPlayer }) => {
  return (
    <div className='container_footer_hud'>
      <div className='container_hp_footer_hud'>
        <div className='hp_footer_hud' style={{ width: `${player.hp}%` }}></div>
        <div className='hp_ghost_footer_hud'></div>
      </div>
      <div className='container_button_footer_hud'>
        <button className='button_footer_hud' disabled={disableButtonPlayer} onClick={() => {
          vibrate(10); // Apenas um "clique" mecânico leve
          handleBullet('pedra', 'player');
        }}>
          {/** <span className='emoji_footer'>🗿</span> */}
          <img src="/assets/1_pedra.png" height={30}></img>
          <span>Pedra</span>
        </button>
        <button className='button_footer_hud' disabled={disableButtonPlayer} onClick={() => {
          vibrate(10); // Apenas um "clique" mecânico leve
          handleBullet('papel', 'player');
        }}>
          {/**<span className='emoji_footer'>📄</span> */}
          <img src="/assets/2_papel.png" height={30}></img>
          <span>Papel</span></button>
        <button className='button_footer_hud' disabled={disableButtonPlayer} onClick={() => {
          vibrate(10); // Apenas um "clique" mecânico leve
          handleBullet('tesoura', 'player');
        }}>
          {/**<span className='emoji_footer'>✂️</span> */}
          <img src="/assets/3_tesoura.png" height={30}></img>
          <span>Tesoura</span>
        </button>
      </div>
    </div>
  )
}