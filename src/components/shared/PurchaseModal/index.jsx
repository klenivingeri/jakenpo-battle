import './PurchaseModal.css'

export const PurchaseModal = ({ 
  isOpen, 
  onClose, 
  room, 
  playerGold, 
  onPurchase,
  roomStars = []
}) => {
  if (!isOpen || !room) return null

  const canAfford = playerGold >= room.unlockCost
  const remaining = Math.max(0, room.unlockCost - playerGold)
  
  // Verificar se tem pelo menos 1 estrela na fase anterior
  const previousRoomIndex = room.id - 2; // room.id é 1-based
  const hasPreviousRoomStar = previousRoomIndex < 0 || (roomStars[previousRoomIndex] >= 1)

  const handlePurchase = () => {
    if (canAfford && hasPreviousRoomStar) {
      onPurchase(room)
      onClose()
    }
  }

  return (
    <div className="purchase-modal-overlay" onClick={onClose}>
      <div className="purchase-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="purchase-modal-header">
          <h2>🔓 Desbloquear Fase</h2>
          <button className="purchase-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="purchase-modal-body">
          {/* Informações da Fase */}
          <div className="purchase-room-info">
            <div className="purchase-room-number">
              Fase {room.id}
            </div>
            <div className="purchase-room-details">
              <span>⏱️ {room.gameDuration}s</span>
              <span>⚡ {room.speed.toFixed(1)}x</span>
              <span>🎯 {room.bulletsPerAction}x</span>
            </div>
          </div>

          {/* Custo */}
          <div className="purchase-cost-section">
            <div className="purchase-cost-label">Custo:</div>
            <div className="purchase-cost-value">
              🪙 {room.unlockCost.toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Status do Jogador */}
          <div className="purchase-player-status">
            <div className="purchase-player-gold">
              <span className="purchase-label">Seu Gold:</span>
              <span className="purchase-value">
                🪙 {playerGold.toLocaleString('pt-BR')}
              </span>
            </div>

            {!canAfford && (
              <div className="purchase-remaining">
                <span className="purchase-label">Faltam:</span>
                <span className="purchase-value-missing">
                  🪙 {remaining.toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Barra de Progresso */}
          <div className="purchase-progress-container">
            <div 
              className="purchase-progress-bar" 
              style={{ 
                width: `${Math.min((playerGold / room.unlockCost) * 100, 100)}%`,
                background: canAfford 
                  ? '#00FF00' 
                  : '#FF6B00'
              }}
            >
              <span className="purchase-progress-text">
                {Math.floor((playerGold / room.unlockCost) * 100)}%
              </span>
            </div>
          </div>

          {/* Botão de Compra */}
          {!hasPreviousRoomStar ? (
            <div className="purchase-insufficient">
              <p>⚠️ Requisito não atendido</p>
              <p className="purchase-hint">
                Você precisa ter pelo menos 1 ⭐ na Fase {room.id - 1}!
              </p>
            </div>
          ) : canAfford ? (
            <button 
              className="purchase-button purchase-button-buy"
              onClick={handlePurchase}
            >
              ✨ Desbloquear Fase
            </button>
          ) : (
            <div className="purchase-insufficient">
              <p>⚠️ Gold insuficiente</p>
              <p className="purchase-hint">
                Jogue as fases anteriores para ganhar mais gold!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PurchaseModal
