import './GameStats.css';

// Componente reutilizável com melhor legibilidade e design
export const GameStats = ({ timeLeft, wins, losses, draws, gold }) => {
  return (
    <>
      <div className="game-stats game-stats-left">
        <div className="game-stats-time-section">
          <span className="game-stats-label">⏱️</span>
          <span className="game-stats-value game-stats-time">{timeLeft}s</span>
        </div>

      </div>
      <div className="game-stats game-stats-right-gold">
                <div className="game-stats-time-section">
          <span className="game-stats-label">🪙</span>
          <span className="game-stats-value game-stats-time">{gold}</span>
        </div>
      </div>

      <div className="game-stats game-stats-right">
        <div className="game-stats-combat-section">
          <div className="game-stats-combat-values">
            <span className="game-stats-value game-stats-wins">
              {wins}</span>
            <span className="game-stats-separator">/</span>
            <span className="game-stats-value game-stats-losses">
              {losses}</span>
            <span className="game-stats-separator">/</span>
            <span className="game-stats-value game-stats-draws">
              {draws}</span>
          </div>
        </div>
      </div>
    </>
  )
}
