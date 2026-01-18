  export const ResultScene = ({gameStats, setScene}) => {
  return <div  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '3px solid black',
      width: '100%',
      height: '100%',
      background: 'white',
      opacity: 0.9,
    }}>
      <div className="botao-pulsar">
        {gameStats.result === 'win' && (
          <div>
            {Array.from({ length: gameStats.stars }).map((_, i) => (
              <span key={i} style={{ fontSize: '3rem' }}>⭐</span>
            ))}
          </div>
        )}
        <h1 className='' style={{ fontSize: '3rem' }}>{gameStats.result === 'win' ? 'Você Venceu!' : 'Você Perdeu!'}</h1>
        <h3 className=''>Durante a Batalha</h3>
        <p>Vitórias: {gameStats.wins}</p>
        <p>Derrotas: {gameStats.losses}</p>
        <p>Empates: {gameStats.draws}</p>
        <p style={{ color: 'orange', fontWeight: 'bold' }}>Gold Coletado: {gameStats.gold || 0}</p>
        <button className='button_footer' style={{ padding: '10px', marginTop: '20px', fontSize: '1.8rem' }} onClick={() => setScene('Init')}>
          Ir para o menu
        </button>
      </div>
    </div>
  </div>;
}