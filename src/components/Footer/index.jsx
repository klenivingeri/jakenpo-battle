import { useNavigate } from 'react-router-dom';
import './Footer.css'

export const Footer = ({ setScene }) => {
  const navigate = useNavigate();
  
  return (
    <div className='container_footer'>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {/* pode ser ads */}
      </div>
    </div>
  )
}