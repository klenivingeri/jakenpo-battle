import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgrounds from '../../data/galery.json';
import { getPlayerRegistry, savePlayerRegistry, purchaseBackground, equipBackground } from '../../utils/storageUtils';

const Galery = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());

  // Salvar no localStorage quando mudar
  useEffect(() => {
    savePlayerRegistry(playerRegistry);
    // Dispara evento para atualizar o App
    window.dispatchEvent(new Event('backgroundChanged'));
  }, [playerRegistry]);

  const handlePurchase = (bg) => {
    const updated = purchaseBackground(bg.path, bg.price);
    if (updated) {
      setPlayerRegistry(updated);
    }
  };

  const handleEquip = (bgPath) => {
    const updated = equipBackground(bgPath);
    setPlayerRegistry(updated);
  };

  const isOwned = (bgPath) => playerRegistry.ownedBackgrounds.includes(bgPath);
  const isEquipped = (bgPath) => playerRegistry.equippedBackground === bgPath;
  const isDefault = (bg) => bg.default === true;

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        background: '#FF0000',
        color: '#fff',
        border: '6px solid #000',
        width: '90%',
        maxWidth: 600,
        margin: '32px 0 16px 0',
        padding: 16,
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '3px 3px 0 #000',
        letterSpacing: 2,
        textTransform: 'uppercase',
        boxShadow: '4px 4px 0 0 #0008',
      }}>
        🎨 Galeria
        <div style={{ fontSize: '1rem', marginTop: 8 }}>
          🪙 Gold: {playerRegistry.gold}
        </div>
      </div>
      
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '150px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
          width: '90%',
          maxWidth: 900,
        }}>
          {backgrounds.map((bg, idx) => (
            <div key={idx} style={{
              background: '#fff',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 0 #0008',
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative',
              outline: selected === idx ? '4px solid #FFD700' : 'none',
              transition: 'outline 0.2s',
            }}
              onClick={() => setSelected(idx)}
            >
              <div style={{
                width: 90,
                height: 150,
                border: '2px solid #000',
                marginBottom: 8,
                background: '#222',
                backgroundImage: `url(${bg.path})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: bg.pan?.baseX ? `${bg.pan.baseX}% 50%` : 'center center',
              }} />
              <div style={{ fontWeight: 'bold', color: '#000', fontSize: '1.1rem', textShadow: '1px 1px 0 #fff' }}>{bg.name}</div>
              
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                {isEquipped(bg.path) ? (
                  <button 
                    className='button_footer' 
                    style={{
                      fontSize: '0.9rem',
                      padding: '8px',
                      background: '#4CAF50',
                      cursor: 'default'
                    }}
                    disabled
                  >
                    ✓ Equipado
                  </button>
                ) : isOwned(bg.path) || isDefault(bg) ? (
                  <button 
                    className='button_footer botao-pulsar' 
                    style={{fontSize: '0.9rem', padding: '8px'}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEquip(bg.path);
                    }}
                  >
                    Equipar
                  </button>
                ) : (
                  <button 
                    className='button_footer botao-pulsar' 
                    style={{
                      fontSize: '0.9rem',
                      padding: '8px',
                      opacity: playerRegistry.gold < bg.price ? 0.5 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(bg);
                    }}
                    disabled={playerRegistry.gold < bg.price}
                  >
                    🪙 Comprar {bg.price}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    <div className='container_footer'>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className='button_footer botao-pulsar' style={{background: '#00BFFF',   borderBottom: '6px solid rgb(0, 115, 209)'}} onClick={() => navigate('/Init')}>
            <span>Voltar</span>
          </button>
        </div>
        </div>
    </div>
  );
};

export default Galery;
