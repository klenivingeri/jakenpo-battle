  export const ResultScene = ({gameStats, setScene, isInfiniteMode = false, isChaosMode = false}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: (isInfiniteMode || isChaosMode) ? '10px' : '20px',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '6px solid #000000',
      width: '90%',
      maxWidth: '500px',
      background: '#ffffff',
      boxShadow: '8px 8px 0 0 rgba(0, 0, 0, 0.3)',
      padding: (isInfiniteMode || isChaosMode) ? '15px 10px' : '30px 20px',
    }}>
      {/* Badge Modo Infinito */}
      {isInfiniteMode && (
        <div style={{
          width: '100%',
          padding: '8px',
          background: '#8e44ad',
          border: '4px solid #000000',
          marginBottom: '10px',
          boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '1rem',
            color: '#ffffff',
            textShadow: '2px 2px 0 #000000',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            ♾️ MODO INFINITO
          </span>
        </div>
      )}
      
      {/* Badge Modo Caos */}
      {isChaosMode && (
        <div style={{
          width: '100%',
          padding: '8px',
          background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
          border: '4px solid #000000',
          marginBottom: '10px',
          boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '1rem',
            color: '#ffffff',
            textShadow: '2px 2px 0 #000000',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            🌪️ MODO CAOS
          </span>
        </div>
      )}

      {/* Header com resultado */}
      <div style={{
        width: '100%',
        padding: (isInfiniteMode || isChaosMode) ? '12px' : '20px',
        background: gameStats.result === 'win' ? '#00FF00' : '#FF0000',
        border: '6px solid #000000',
        marginBottom: (isInfiniteMode || isChaosMode) ? '12px' : '24px',
        boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
      }}>
        <h1 style={{ 
          fontSize: (isInfiniteMode || isChaosMode) ? '1.5rem' : '2rem',
          margin: '0',
          color: '#ffffff',
          textShadow: '3px 3px 0 #000000',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          {gameStats.result === 'win' ? '🎉 Vitória!' : '💀 Derrota!'}
        </h1>
        
        {gameStats.result === 'win' && gameStats.stars > 0 && (
          <div className="botao-pulsar">
            {Array.from({ length: gameStats.stars }).map((_, i) => (
              <span key={i} style={{ fontSize: (isInfiniteMode || isChaosMode) ? '1.8rem' : '2.5rem' }}>⭐</span>
            ))}
          </div>
        )}
      </div>

      {/* Informações do Modo Infinito/Caos */}
      {(isInfiniteMode || isChaosMode) && (
        <div style={{
          width: '100%',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px',
          }}>
            <div style={{
              flex: 1,
              padding: '10px',
              background: isChaosMode ? '#ff0000' : '#3498db',
              border: '4px solid #000000',
              textAlign: 'center',
              boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#ffffff',
                fontWeight: 'bold',
                marginBottom: '2px',
              }}>
                FASES
              </div>
              <div style={{
                fontSize: '1.5rem',
                color: '#ffffff',
                textShadow: '2px 2px 0 #000000',
                fontWeight: 'bold',
              }}>
                {gameStats.phasesCompleted || 0}
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: '10px',
              background: '#f1c40f',
              border: '4px solid #000000',
              textAlign: 'center',
              boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.3)',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#000000',
                fontWeight: 'bold',
                marginBottom: '2px',
              }}>
                TEMPO
              </div>
              <div style={{
                fontSize: '1.2rem',
                color: '#000000',
                textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
                fontWeight: 'bold',
              }}>
                {formatTime(gameStats.totalTime || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas da Batalha */}
      <div style={{
        width: '100%',
        marginBottom: (isInfiniteMode || isChaosMode) ? '10px' : '20px',
      }}>
        <h3 style={{
          fontSize: (isInfiniteMode || isChaosMode) ? '1rem' : '1.2rem',
          marginBottom: (isInfiniteMode || isChaosMode) ? '8px' : '16px',
          color: '#000000',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}>
          📊 Durante a Batalha
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: (isInfiniteMode || isChaosMode) ? '8px' : '12px',
        }}>
          <div style={{
            padding: (isInfiniteMode || isChaosMode) ? '8px' : '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: (isInfiniteMode || isChaosMode) ? '0.9rem' : '1rem',
          }}>
            <span>Vitórias:</span>
            <span style={{ color: '#00CC00' }}>{gameStats.wins}</span>
          </div>

          <div style={{
            padding: (isInfiniteMode || isChaosMode) ? '8px' : '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: (isInfiniteMode || isChaosMode) ? '0.9rem' : '1rem',
          }}>
            <span>Derrotas:</span>
            <span style={{ color: '#FF0000' }}>{gameStats.losses}</span>
          </div>

          <div style={{
            padding: (isInfiniteMode || isChaosMode) ? '8px' : '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: (isInfiniteMode || isChaosMode) ? '0.9rem' : '1rem',
          }}>
            <span>Empates:</span>
            <span style={{ color: '#FF9800' }}>{gameStats.draws}</span>
          </div>

          {/* Gold Coletado */}
          <div style={{
            padding: (isInfiniteMode || isChaosMode) ? '10px' : '16px',
            background: '#FFD700',
            border: (isInfiniteMode || isChaosMode) ? '4px solid #000000' : '5px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
          }}>
            <span style={{ fontSize: (isInfiniteMode || isChaosMode) ? '0.95rem' : '1.1rem' }}>🪙 Gold:</span>
            <span style={{ 
              fontSize: (isInfiniteMode || isChaosMode) ? '1.1rem' : '1.3rem',
              color: '#000000',
              textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)'
            }}>
              {gameStats.gold || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Botões */}
      {isInfiniteMode && (
        <button 
          className='button_footer' 
          style={{ 
            width: '100%',
            padding: '16px',
            marginBottom: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            background: '#8e44ad',
            color: '#ffffff',
          }} 
          onClick={() => setScene('GameInfinite')}
        >
          🔄 Tentar Novamente
        </button>
      )}
      
      {isChaosMode && (
        <button 
          className='button_footer' 
          style={{ 
            width: '100%',
            padding: '16px',
            marginBottom: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
            color: '#ffffff',
            textShadow: '2px 2px 0 #000000',
          }} 
          onClick={() => setScene('GameChaos')}
        >
          🔄 Tentar Novamente
        </button>
      )}

      {/* Botão de Menu */}
      <button 
        className='button_footer' 
        style={{ 
          width: '100%',
          padding: '16px',
          marginTop: '10px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
        }} 
        onClick={() => setScene('Init')}
      >
        📋 Menu Principal
      </button>
    </div>
  </div>;
}