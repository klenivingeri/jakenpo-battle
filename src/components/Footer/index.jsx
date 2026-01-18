import { useNavigate } from 'react-router-dom';
import './Footer.css'

export const Footer = ({ setScene }) => {
  const navigate = useNavigate();
  
  return (
    <div className='container_footer'>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className='button_footer botao-pulsar'>
          <span className='emoji_footer'>⚔️</span>
          <span>Infinito</span>
        </button>
        <button className='button_footer botao-pulsar' onClick={() => navigate('/galeria')}>
          <span className='emoji_footer' >🖼️</span>
          <span>⚔️</span>
          <span>Loja</span>
        </button>
      </div>
    </div>
  )
}