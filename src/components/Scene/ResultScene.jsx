  export const ResultScene = ({gameStats, setScene}) => {
  return <div className="botao-pulsar" style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
    width: '100%',
    height: '100%'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '3px solid black',
      width: '100%',
      height: '100%'
    }}>
      <div>
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
        <button className='button_footer' style={{ padding: '10px', marginTop: '20px', fontSize: '1rem' }} onClick={() => setScene('Init')}>
          Voltar para o menu
        </button>
      </div>
    </div>
  </div>;
}