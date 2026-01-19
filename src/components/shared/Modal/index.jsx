import React from 'react';

const Modal = ({ isOpen, onClose, isDarkMode, setIsDarkMode, isMusicOn, setIsMusicOn, isEconomyDebugOn, setIsEconomyDebugOn }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#ffffff',
          border: '6px solid #000000',
          boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          minWidth: '400px',
          maxWidth: '90%',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '6px solid #000000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#FF0000',
        }}>
          <h2 style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '1.5rem',
            textShadow: '3px 3px 0 #000000',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            ⚙️ Configurações
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '4px solid #000000',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
              transition: 'all 0.1s ease',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 0 rgba(0, 0, 0, 0.3)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.3)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Efeitos Sonoros */}
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode((prev) => !prev)}
                style={{
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  accentColor: '#00BFFF',
                }}
              />
              EFEITOS SONOROS
            </label>
          </div>

          {/* Música */}
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}>
              <input
                type="checkbox"
                checked={isMusicOn}
                onChange={(e) => setIsMusicOn(e.target.checked)}
                style={{
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  accentColor: '#00BFFF',
                }}
              />
              MÚSICA
            </label>
          </div>

          {/* Economy Debug */}
          {isEconomyDebugOn !== undefined && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#E0E0E0',
              border: '4px solid #000000',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}>
                <input
                  type="checkbox"
                  checked={isEconomyDebugOn}
                  onChange={(e) => setIsEconomyDebugOn(e.target.checked)}
                  style={{
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    accentColor: '#00BFFF',
                  }}
                />
                💰 DEBUG ECONOMIA
              </label>
            </div>
          )}

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              background: '#00BFFF',
              border: '5px solid #000000',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.5)',
              transition: 'all 0.1s ease',
              marginTop: '10px',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 0 rgba(0, 0, 0, 0.5)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0, 0, 0, 0.5)';
            }}
          >
            OK
          </button>
        </div>
      </div>
    </>
  );
};

export default Modal;
