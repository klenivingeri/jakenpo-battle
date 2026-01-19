import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import skillsData from '../../data/skill_bullet.json';
import backgrounds from '../../data/galery.json';
import { getPlayerRegistry, savePlayerRegistry, purchaseSkill, equipSkill, purchaseBackground, equipBackground } from '../../utils/storageUtils';

const Shop = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('pedra');
  const [selected, setSelected] = useState(null);
  const [playerRegistry, setPlayerRegistry] = useState(() => getPlayerRegistry());

  useEffect(() => {
    savePlayerRegistry(playerRegistry);
    window.dispatchEvent(new Event('skillsChanged'));
  }, [playerRegistry]);

  const handlePurchase = (skill, category) => {
    const itemId = skill.path || skill.color;
    const updated = purchaseSkill(category, itemId, skill.price);
    if (updated) {
      setPlayerRegistry(updated);
    }
  };

  const handleEquip = (itemId, category) => {
    const updated = equipSkill(category, itemId);
    setPlayerRegistry(updated);
  };

  const isOwned = (itemId, category) => playerRegistry.ownedSkills[category]?.includes(itemId);
  const isEquipped = (itemId, category) => playerRegistry.equippedSkills[category] === itemId;
  const isDefault = (skill) => skill.default === true;

  const categories = [
    { key: 'pedra', label: '🪨 Pedra', emoji: '🪨' },
    { key: 'papel', label: '📄 Papel', emoji: '📄' },
    { key: 'tesoura', label: '✂️ Tesoura', emoji: '✂️' },
    { key: 'calda', label: '🌈 Rastro', emoji: '🌈' },
    { key: 'galeria', label: '🖼️ Galeria', emoji: '🖼️' }
  ];

  
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        background: '#FF6B00',
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
        🛒 Loja de Skills
        <div style={{ fontSize: '1rem', marginTop: 8 }}>
          🪙 Gold: {playerRegistry.gold}
        </div>
      </div>

      {/* Tabs de Categorias */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: '0 16px'
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            className='button_footer'
            style={{
              fontSize: '0.8rem',
              padding: '12px 12px',
              background: selectedCategory === cat.key ? '#FFD700' : '#fff',
              color: selectedCategory === cat.key ? '#000' : '#333',
              opacity: selectedCategory === cat.key ? 1 : 0.7,
              transform: selectedCategory === cat.key ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>


      {/* Conteúdo das abas */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '150px'
      }}>
        {selectedCategory !== 'galeria' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
            width: '95%',
            maxWidth: 900,
          }}>
            {skillsData[selectedCategory]?.map((skill, idx) => {
              const itemId = skill.path || skill.color;
              const isColorItem = selectedCategory === 'calda';
              return (
                <div key={idx} style={{
                  background: '#fff',
                  border: '4px solid #000',
                  boxShadow: '4px 4px 0 0 #0008',
                  padding: 12,
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
                    width: 80,
                    height: 80,
                    border: '3px solid #000',
                    marginBottom: 8,
                    background: isColorItem ? skill.color : '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}>
                    {!isColorItem && (
                      <img
                        src={skill.path}
                        alt={skill.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    )}
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#000',
                    fontSize: '1rem',
                    textAlign: 'center',
                    marginBottom: 8
                  }}>
                    {skill.name}
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                    {isEquipped(itemId, selectedCategory) ? (
                      <button
                        className='button_footer'
                        style={{
                          fontSize: '0.85rem',
                          padding: '8px',
                          background: '#4CAF50',
                          cursor: 'default'
                        }}
                        disabled
                      >
                        ✓ Equipada
                      </button>
                    ) : isOwned(itemId, selectedCategory) || isDefault(skill) ? (
                      <button
                        className='button_footer botao-pulsar'
                        style={{ fontSize: '0.85rem', padding: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(itemId, selectedCategory);
                        }}
                      >
                        Equipar
                      </button>
                    ) : (
                      <button
                        className='button_footer botao-pulsar'
                        style={{
                          fontSize: '0.85rem',
                          padding: '8px',
                          opacity: playerRegistry.gold < skill.price ? 0.5 : 1
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(skill, selectedCategory);
                        }}
                        disabled={playerRegistry.gold < skill.price}
                      >
                        🪙 Comprar {skill.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 20,
            width: '95%',
            maxWidth: 900,
          }}>
            {backgrounds.map((bg, idx) => (
              <div key={idx} style={{
                background: '#fff',
                border: '4px solid #000',
                boxShadow: '4px 4px 0 0 #0008',
                padding: 12,
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
                  width: 80,
                  height: 80,
                  border: '3px solid #000',
                  marginBottom: 8,
                  background: '#222',
                  backgroundImage: `url(${bg.path})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: bg.pan?.baseX ? `${bg.pan.baseX}% 50%` : 'center center',
                  borderRadius: 8,
                }} />
                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '1rem', textAlign: 'center', marginBottom: 8 }}>{bg.name}</div>
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  {playerRegistry.equippedBackground === bg.path ? (
                    <button 
                      className='button_footer' 
                      style={{
                        fontSize: '0.85rem',
                        padding: '8px',
                        background: '#4CAF50',
                        cursor: 'default'
                      }}
                      disabled
                    >
                      ✓ Equipado
                    </button>
                  ) : (playerRegistry.ownedBackgrounds.includes(bg.path) || bg.default) ? (
                    <button 
                      className='button_footer botao-pulsar' 
                      style={{fontSize: '0.85rem', padding: '8px'}}
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = equipBackground(bg.path);
                        setPlayerRegistry(updated);
                      }}
                    >
                      Equipar
                    </button>
                  ) : (
                    <button 
                      className='button_footer botao-pulsar' 
                      style={{
                        fontSize: '0.85rem',
                        padding: '8px',
                        opacity: playerRegistry.gold < bg.price ? 0.5 : 1
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = purchaseBackground(bg.path, bg.price);
                        if (updated) setPlayerRegistry(updated);
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
        )}
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

export default Shop;
