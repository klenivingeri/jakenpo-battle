import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './Game';
import Galery from './components/galery';
import Shop from './components/shop';
import { getEquippedBackground } from './utils/storageUtils';
import './App.css';

function App() {
  const [bgPos, setBgPos] = useState({ x: 50, y: 50 });
  
  const [equippedBackground, setEquippedBackground] = useState(getEquippedBackground());

  // Atualiza o fundo quando o localStorage mudar
  useEffect(() => {
    const handleStorageChange = () => {
      setEquippedBackground(getEquippedBackground());
    };

    window.addEventListener('storage', handleStorageChange);
    // Também escuta eventos customizados para mudanças no mesmo tab
    window.addEventListener('backgroundChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('backgroundChanged', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Ambiente sem window (SSR / build)
    if (typeof window === 'undefined') return;

    // API não existe
    if (!('DeviceOrientationEvent' in window)) {
      console.log('DeviceOrientation não suportado');
      return;
    }

    let rafId = null;
    let enabled = true;

    const handleOrientation = (event) => {
      if (!enabled || rafId) return;

      rafId = requestAnimationFrame(() => {
        // Alguns dispositivos retornam null
        const gamma = typeof event.gamma === 'number' ? event.gamma : 0;
        const beta  = typeof event.beta === 'number' ? event.beta : 0;

        const x = 50 + gamma * 0.2;
        const y = 50 + beta * 0.1;

        setBgPos(prev => {
          const nx = Math.max(0, Math.min(100, x));
          const ny = Math.max(0, Math.min(100, y));
          if (prev.x === nx && prev.y === ny) return prev;
          return { x: nx, y: ny };
        });

        rafId = null;
      });
    };

    const start = async () => {
      try {
        // iOS (precisa de permissão explícita)
        if (
          typeof window.DeviceOrientationEvent?.requestPermission === 'function'
        ) {
          const permission = await window.DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') return;
        }

        window.addEventListener('deviceorientation', handleOrientation, true);
      } catch (err) {
        console.warn('DeviceOrientation indisponível:', err);
      }
    };

    start();

    return () => {
      enabled = false;
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  return (
    <BrowserRouter>
      <div className='app-container'>
        <div className='game-screen' style={{
          backgroundImage: `url(${equippedBackground})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: `${clamp(bgPos.x, 45, 55)}% ${clamp(bgPos.y, 45, 55)}%`,
          width: '100%',
          height: '100vh'
        }}>
          <Routes>
            <Route path="/" element={<Game initialScene="Start" />} />
            <Route path="/init" element={<Game initialScene="Init" />} />
            <Route path="/galeria" element={<Galery />} />
            <Route path="/loja" element={<Shop />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;