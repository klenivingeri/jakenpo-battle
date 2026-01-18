  export const ResultScene = ({gameStats, setScene}) => {
  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    width: '100%',
    height: '100%',
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
      padding: '30px 20px',
    }}>
      {/* Header com resultado */}
      <div style={{
        width: '100%',
        padding: '20px',
        background: gameStats.result === 'win' ? '#00FF00' : '#FF0000',
        border: '6px solid #000000',
        marginBottom: '24px',
        boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
      }}>
        <h1 style={{ 
          fontSize: '2rem',
          margin: '0 0 12px 0',
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
              <span key={i} style={{ fontSize: '2.5rem' }}>⭐</span>
            ))}
          </div>
        )}
      </div>

      {/* Estatísticas da Batalha */}
      <div style={{
        width: '100%',
        marginBottom: '20px',
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '16px',
          color: '#000000',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}>
          📊 Durante a Batalha
        </h3>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            padding: '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
          }}>
            <span>Vitórias:</span>
            <span style={{ color: '#00CC00' }}>{gameStats.wins}</span>
          </div>

          <div style={{
            padding: '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
          }}>
            <span>Derrotas:</span>
            <span style={{ color: '#FF0000' }}>{gameStats.losses}</span>
          </div>

          <div style={{
            padding: '12px',
            background: '#E0E0E0',
            border: '4px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
          }}>
            <span>Empates:</span>
            <span style={{ color: '#FF9800' }}>{gameStats.draws}</span>
          </div>

          {/* Gold Coletado */}
          <div style={{
            padding: '16px',
            background: '#FFD700',
            border: '5px solid #000000',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>🪙 Gold:</span>
            <span style={{ 
              fontSize: '1.3rem',
              color: '#000000',
              textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)'
            }}>
              {gameStats.gold || 0}
            </span>
          </div>
        </div>
      </div>

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