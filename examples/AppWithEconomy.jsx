/**
 * 🎮 EXEMPLO COMPLETO DE INTEGRAÇÃO
 * 
 * Este arquivo mostra como integrar completamente o sistema de economia
 * no App.jsx principal do jogo.
 * 
 * Copie e adapte as partes necessárias para seu código.
 */

import { useState, useEffect, useMemo } from 'react'
import { calculateUnlockCost, canUnlockRoom } from './utils/economyUtils'
import { UnlockCost } from './components/shared/UnlockCost'
import { ProgressionDebug } from './components/debug/ProgressionDebug'

function AppWithEconomy() {
  // ==========================================
  // ESTADO DO JOGADOR (com Gold)
  // ==========================================
  
  const [gameStats, setGameStats] = useState(() => {
    const saved = localStorage.getItem('gameStats')
    return saved ? JSON.parse(saved) : {
      gold: 0,           // ← Gold atual do jogador
      wins: 0,
      losses: 0,
      draws: 0
    }
  })

  const [roomCurrent, setRoomCurrent] = useState(() => {
    const saved = localStorage.getItem('roomCurrent')
    return saved ? JSON.parse(saved) : 0
  })

  const [activeRoomIndex, setActiveRoomIndex] = useState(0)
  const [scene, setScene] = useState('Start') // 'Start', 'Game', 'Result'

  // ==========================================
  // PERSISTÊNCIA (salva gold)
  // ==========================================
  
  useEffect(() => {
    localStorage.setItem('gameStats', JSON.stringify(gameStats))
    localStorage.setItem('roomCurrent', JSON.stringify(roomCurrent))
  }, [gameStats, roomCurrent])

  // ==========================================
  // GERAÇÃO DE ROOMS (com unlockCost)
  // ==========================================
  
  const rooms = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const level = i + 1
      const resetIndex = i % 5

      // Configurações de velocidade e spawn
      const baseSpeed = 2 + (Math.floor(resetIndex / 2) * 0.40)
      const baseSpawnInterval = Math.max(600, 3000 - (Math.min(resetIndex, 20) * 100))

      // Sistema de drops
      const progressFactor = Math.min(i / 99, 1)
      const commonDrop = Math.max(10, 100 - (progressFactor * 60))
      const uncommonDrop = Math.min(30, progressFactor * 30)
      const rareDrop = Math.min(20, progressFactor * 20)
      const heroicDrop = Math.min(15, progressFactor * 15)
      const legendaryDrop = Math.min(10, progressFactor * 10)
      const mythicDrop = Math.min(8, progressFactor * 8)
      const immortalDrop = Math.min(7, progressFactor * 7)
      
      const total = commonDrop + uncommonDrop + rareDrop + heroicDrop + 
                    legendaryDrop + mythicDrop + immortalDrop
      
      // ✨ Calcula o custo de desbloqueio
      const unlockCost = calculateUnlockCost(level)
      
      return {
        id: level,
        unlockCost,        // ← Campo adicionado
        gameDuration: 30 + resetIndex,
        speed: baseSpeed,
        spawnInterval: baseSpawnInterval,
        bulletsPerAction: 1,
        disableButton: i > roomCurrent,
        enemy: {
          common: { drop: (commonDrop / total) * 100 },
          uncommon: { drop: (uncommonDrop / total) * 100 },
          rare: { drop: (rareDrop / total) * 100 },
          heroic: { drop: (heroicDrop / total) * 100 },
          legendary: { drop: (legendaryDrop / total) * 100 },
          mythic: { drop: (mythicDrop / total) * 100 },
          immortal: { drop: (immortalDrop / total) * 100 }
        }
      }
    })
  }, [roomCurrent])

  // ==========================================
  // GANHO DE GOLD (ao derrotar inimigo)
  // ==========================================
  
  const handleEnemyDefeated = (enemy) => {
    // Adiciona gold baseado na raridade
    setGameStats(prev => ({
      ...prev,
      gold: prev.gold + enemy.gold
    }))

    // Feedback visual (implementar)
    showGoldNotification(enemy.gold, enemy.rarity, enemy.x, enemy.y)
  }

  // ==========================================
  // SISTEMA DE DESBLOQUEIO
  // ==========================================
  
  const handleRoomSelect = (roomIndex) => {
    const room = rooms[roomIndex]
    const nextRoomIndex = roomCurrent + 1

    // Fase já desbloqueada - apenas joga
    if (roomIndex <= roomCurrent) {
      setActiveRoomIndex(roomIndex)
      setScene('Game')
      return
    }

    // Próxima fase - verifica gold
    if (roomIndex === nextRoomIndex) {
      if (canUnlockRoom(gameStats.gold, room.id)) {
        // ✅ Tem gold suficiente
        setGameStats(prev => ({
          ...prev,
          gold: prev.gold - room.unlockCost
        }))
        
        setRoomCurrent(nextRoomIndex)
        setActiveRoomIndex(roomIndex)
        setScene('Game')
        
        // SFX/Feedback
        playUnlockSound()
        showUnlockAnimation(room.id)
      } else {
        // ❌ Não tem gold suficiente
        showNotification(
          `Você precisa de ${room.unlockCost} gold para desbloquear!`,
          'error'
        )
      }
    } else {
      // Fase muito avançada
      showNotification('Desbloqueie as fases anteriores primeiro!', 'warning')
    }
  }

  // ==========================================
  // FIM DE JOGO (adiciona gold ganho)
  // ==========================================
  
  const handleGameEnd = (result, enemiesDefeated, goldEarned) => {
    // Atualiza estatísticas
    setGameStats(prev => ({
      ...prev,
      gold: prev.gold + goldEarned,
      wins: result === 'win' ? prev.wins + 1 : prev.wins,
      losses: result === 'loss' ? prev.losses + 1 : prev.losses,
      draws: result === 'draw' ? prev.draws + 1 : prev.draws
    }))

    setScene('Result')
  }

  // ==========================================
  // RENDER
  // ==========================================
  
  return (
    <div className="App">
      {/* Debug (apenas DEV) */}
      {import.meta.env.DEV && (
        <ProgressionDebug
          rooms={rooms}
          currentRoom={roomCurrent}
          playerGold={gameStats.gold}
        />
      )}

      {/* HUD de Gold (sempre visível) */}
      <div className="gold-hud">
        <span className="gold-icon">💰</span>
        <span className="gold-amount">
          {gameStats.gold.toLocaleString('pt-BR')}
        </span>
      </div>

      {/* Tela Inicial */}
      {scene === 'Start' && (
        <div className="init-scene">
          <h1>Selecione uma Fase</h1>
          
          <div className="rooms-grid">
            {rooms.slice(0, 20).map((room, index) => {
              const isUnlocked = index <= roomCurrent
              const isNext = index === roomCurrent + 1
              const isFuture = index > roomCurrent + 1

              return (
                <div 
                  key={room.id}
                  className={`room-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => handleRoomSelect(index)}
                >
                  {/* Header */}
                  <div className="room-header">
                    <h3>Fase {room.id}</h3>
                  </div>

                  {/* Info */}
                  <div className="room-info">
                    <span>⏱️ {room.gameDuration}s</span>
                    <span>⚡ {room.speed.toFixed(1)}x</span>
                  </div>

                  {/* Status de desbloqueio */}
                  {isNext && (
                    <UnlockCost
                      unlockCost={room.unlockCost}
                      playerGold={gameStats.gold}
                      isUnlocked={false}
                    />
                  )}

                  {isFuture && (
                    <div className="room-locked">
                      🔒 Bloqueado
                    </div>
                  )}

                  {isUnlocked && (
                    <button className="room-play-btn">
                      ▶️ Jogar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tela de Jogo */}
      {scene === 'Game' && (
        <GameScene
          room={rooms[activeRoomIndex]}
          playerGold={gameStats.gold}
          onEnemyDefeated={handleEnemyDefeated}
          onGameEnd={handleGameEnd}
        />
      )}

      {/* Tela de Resultado */}
      {scene === 'Result' && (
        <ResultScene
          gameStats={gameStats}
          onContinue={() => setScene('Start')}
        />
      )}
    </div>
  )
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

const showGoldNotification = (amount, rarity, x, y) => {
  // Implementar: Mostrar notificação flutuante
  console.log(`+${amount} gold (${rarity})`)
}

const playUnlockSound = () => {
  // Implementar: Tocar som de desbloqueio
  console.log('🎵 Unlock sound')
}

const showUnlockAnimation = (level) => {
  // Implementar: Animação de desbloqueio
  console.log(`✨ Fase ${level} desbloqueada!`)
}

const showNotification = (message, type = 'info') => {
  // Implementar: Toast/Alert
  alert(message)
}

// ==========================================
// COMPONENTE GAMESCENE MODIFICADO
// ==========================================

function GameScene({ room, playerGold, onEnemyDefeated, onGameEnd }) {
  const [enemies, setEnemies] = useState([])
  const [goldEarned, setGoldEarned] = useState(0)
  const [timeLeft, setTimeLeft] = useState(room.gameDuration)

  // Lógica do jogo...
  // Quando inimigo é derrotado:
  const handleBulletCollision = (bullet) => {
    // Remove inimigo
    setEnemies(prev => prev.filter(e => e.id !== bullet.id))
    
    // Adiciona gold
    setGoldEarned(prev => prev + bullet.gold)
    onEnemyDefeated(bullet)
  }

  // Quando o tempo acaba:
  useEffect(() => {
    if (timeLeft <= 0) {
      onGameEnd('win', enemies.length, goldEarned)
    }
  }, [timeLeft])

  return (
    <div className="game-scene">
      {/* HUD do jogo */}
      <div className="game-hud">
        <div className="time-left">⏱️ {timeLeft}s</div>
        <div className="gold-earned">
          +{goldEarned} 💰
        </div>
      </div>

      {/* Gameplay */}
      <div className="game-area">
        {/* Inimigos, player, bullets, etc. */}
      </div>
    </div>
  )
}

export default AppWithEconomy

// ==========================================
// CSS EXEMPLO (adicionar ao App.css)
// ==========================================

/*

.gold-hud {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  border: 2px solid #f1c40f;
  box-shadow: 0 0 20px rgba(241, 196, 15, 0.5);
  z-index: 1000;
}

.gold-icon {
  font-size: 24px;
  animation: bounce 2s infinite;
}

.gold-amount {
  color: #f1c40f;
  text-shadow: 0 0 10px rgba(241, 196, 15, 0.8);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.room-card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.room-card:hover {
  transform: translateY(-5px);
  border-color: rgba(52, 152, 219, 0.8);
  box-shadow: 0 10px 30px rgba(52, 152, 219, 0.3);
}

.room-card.unlocked {
  border-color: rgba(46, 204, 113, 0.4);
}

.room-card.locked {
  border-color: rgba(231, 76, 60, 0.4);
  opacity: 0.7;
}

.room-header h3 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 18px;
}

.room-info {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #95a5a6;
}

.room-play-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.room-play-btn:hover {
  background: linear-gradient(135deg, #27ae60, #229954);
  transform: scale(1.05);
}

.room-locked {
  text-align: center;
  padding: 12px;
  background: rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  color: #e74c3c;
  font-weight: bold;
}

.game-hud {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 999;
}

.time-left, .gold-earned {
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.gold-earned {
  color: #f1c40f;
  border-color: #f1c40f;
  animation: pulse-gold 1s infinite;
}

@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 10px rgba(241, 196, 15, 0.3); }
  50% { box-shadow: 0 0 20px rgba(241, 196, 15, 0.6); }
}

*/
