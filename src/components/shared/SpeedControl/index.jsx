import { useState, useEffect } from 'react';
import './SpeedControl.css';

/**
 * Calcula o multiplicador de velocidade permitido baseado na room atual
 * @param {number} roomLevel - Nível da room atual (1-based)
 * @returns {number} - Multiplicador máximo permitido
 */
const getMaxSpeedMultiplier = (roomLevel) => {
  if (roomLevel >= 150) return 3.5;
  if (roomLevel >= 120) return 3;
  if (roomLevel >= 90) return 2.5;
  if (roomLevel >= 60) return 2;
  if (roomLevel >= 30) return 1.5;
  return 1;
};

/**
 * Componente de controle de velocidade do jogo
 * @param {Object} props
 * @param {number} props.roomLevel - Nível da room atual
 * @param {function} props.onSpeedChange - Callback quando a velocidade muda
 */
export const SpeedControl = ({ roomLevel, onSpeedChange }) => {
  const maxMultiplier = getMaxSpeedMultiplier(roomLevel);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  
  // Reseta a velocidade quando a room muda ou quando o multiplicador máximo diminui
  useEffect(() => {
    if (currentSpeed > maxMultiplier) {
      setCurrentSpeed(maxMultiplier);
      onSpeedChange(maxMultiplier);
    }
  }, [roomLevel, maxMultiplier]);

  // Lista de velocidades disponíveis baseado no nível máximo
  const availableSpeeds = [1, 1.5, 2, 2.5, 3, 3.5].filter(speed => speed <= maxMultiplier);

  const handleSpeedChange = () => {
    const currentIndex = availableSpeeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % availableSpeeds.length;
    const newSpeed = availableSpeeds[nextIndex];
    
    setCurrentSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  return (
    <div className="speed-control">
      <button 
        className="speed-button"
        onClick={handleSpeedChange}
        title={`Velocidade atual: ${currentSpeed}x. Clique para alterar.`}
      >
        <span className="speed-icon">⚡</span>
        <span className="speed-text">{currentSpeed}x</span>
      </button>
      {maxMultiplier > 1 && (
        <div className="speed-info">
          Máximo: {maxMultiplier}x
        </div>
      )}
    </div>
  );
};

export default SpeedControl;
