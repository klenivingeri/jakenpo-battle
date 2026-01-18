import './UnlockCost.css'

/**
 * Componente que exibe o custo e progresso de desbloqueio de uma fase
 * 
 * @param {number} unlockCost - Custo total para desbloquear
 * @param {number} playerGold - Gold atual do jogador
 * @param {boolean} isUnlocked - Se a fase já está desbloqueada
 */
export const UnlockCost = ({ unlockCost, playerGold, isUnlocked }) => {
  if (isUnlocked) {
    return (
      <div className="unlock-cost unlocked">
        <span className="unlock-icon">✅</span>
        <span className="unlock-text">Desbloqueado</span>
      </div>
    )
  }

  const remaining = Math.max(0, unlockCost - playerGold)
  const progress = Math.min((playerGold / unlockCost) * 100, 100)
  const canUnlock = playerGold >= unlockCost

  return (
    <div className={`unlock-cost ${canUnlock ? 'ready' : 'locked'}`}>
      <div className="unlock-header">
        <span className="unlock-icon">{canUnlock ? '🔓' : '🔒'}</span>
        <span className="unlock-cost-value">
          {unlockCost.toLocaleString('pt-BR')} gold
        </span>
      </div>

      <div className="unlock-progress-container">
        <div 
          className="unlock-progress-bar" 
          style={{ width: `${progress}%` }}
          data-progress={Math.floor(progress)}
        >
          <span className="unlock-progress-text">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>

      <div className="unlock-info">
        {canUnlock ? (
          <span className="unlock-ready-text">
            ✨ Pronto para desbloquear!
          </span>
        ) : (
          <>
            <span className="unlock-current">
              Você tem: {playerGold.toLocaleString('pt-BR')} 💰
            </span>
            <span className="unlock-remaining">
              Faltam: {remaining.toLocaleString('pt-BR')} 💰
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export default UnlockCost
