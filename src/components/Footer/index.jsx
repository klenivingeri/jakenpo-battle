import { useNavigate } from 'react-router-dom';
import './Footer.css'

export const Footer = ({ setScene }) => {
  const navigate = useNavigate();
  
  return (
    <div className='container_footer'>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          className='button_footer botao-pulsar' 
          onClick={() => navigate('/galeria')}
          style={{
            padding: '8px 12px',
            minWidth: '44px',
            fontSize: '1.3rem',
          }}
        >
          🖼️
        </button>
        <button 
          className='button_footer botao-pulsar' 
          onClick={() => navigate('/loja')}
          style={{
            padding: '8px 12px',
            minWidth: '44px',
            fontSize: '1.3rem',
          }}
        >
          🛒
        </button>
      </div>
    </div>
  )
}