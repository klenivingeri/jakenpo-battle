import React from 'react';

const Modal = ({ isOpen, onClose, isDarkMode, setIsDarkMode, isMusicOn, setIsMusicOn }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: isDarkMode ? '#333' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        border: '2px solid black',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: '1px solid black',
          width: '30px',
          height: '30px',
          color: 'red',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        ✖
      </button>
      <h2>Configurações</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={() => setIsDarkMode((prev) => !prev)}
          />{' '}
          Dark Mode
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={isMusicOn}
            onChange={(e) => setIsMusicOn(e.target.checked)}
          />{' '}
          Música de Fundo
        </label>
      </div>
    </div>
  );
};

export default Modal;
