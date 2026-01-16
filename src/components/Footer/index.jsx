import './Footer.css'

export const Footer = ({ setScene }) => {
  return (
    <div className='container_footer'>
      <div className='container_button_footer'>
        <button className='button_footer'  onClick={() => setScene('Game')}>
          <span className='emoji_footer'>⚔️</span>
          <span>Iniciar</span>
        </button>
      </div>
    </div>
  )
}