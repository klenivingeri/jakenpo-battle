import './Footer.css'

export const Footer = ({ setScene }) => {
  return (
    <div className='container_footer'>
      <div className=''>
        <button className='button_footer botao-pulsar'>
          <span className='emoji_footer'>⚔️</span>
          <span>Multiplayer</span>
        </button>
      </div>
    </div>
  )
}