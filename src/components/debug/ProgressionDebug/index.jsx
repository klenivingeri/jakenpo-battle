import { useMemo } from 'react'
import { 
  getProgressionStats, 
  calculateUnlockCost,
  calculateExpectedGold 
} from '../../utils/economyUtils'
import './ProgressionDebug.css'

/**
 * Componente de debug para visualizar a progressão econômica
 * Use apenas em desenvolvimento
 */
export const ProgressionDebug = ({ rooms, currentRoom, playerGold }) => {
  const stats = useMemo(() => {
    return rooms.slice(0, 20).map(room => {
      const expectedGold = calculateExpectedGold(
        room.enemy,
        room.gameDuration,
        room.spawnInterval
      )
      
      return {
        level: room.id,
        unlockCost: room.unlockCost,
        expectedGold,
        runsNeeded: room.unlockCost > 0 
          ? Math.ceil(room.unlockCost / expectedGold) 
          : 0,
        isUnlocked: room.id <= currentRoom + 1,
        canAfford: playerGold >= room.unlockCost
      }
    })
  }, [rooms, currentRoom, playerGold])

  const summary = useMemo(() => {
    const totalCost = stats.reduce((sum, s) => sum + s.unlockCost, 0)
    const avgRuns = stats.reduce((sum, s) => sum + s.runsNeeded, 0) / stats.length
    
    return {
      totalCost,
      avgRuns: avgRuns.toFixed(1),
      completionTime: ((avgRuns * 30 * stats.length) / 60).toFixed(1) // minutos
    }
  }, [stats])

  return (
    <div className="progression-debug">
      <div className="debug-header">
        <h3>📊 Debug: Progressão Econômica</h3>
        <div className="debug-summary">
          <span>Gold: {playerGold.toLocaleString('pt-BR')}</span>
          <span>Fase Atual: {currentRoom + 1}</span>
        </div>
      </div>

      <div className="debug-summary-stats">
        <div className="summary-card">
          <span className="summary-label">Custo Total (1-20)</span>
          <span className="summary-value">{summary.totalCost}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Média Rodadas/Fase</span>
          <span className="summary-value">{summary.avgRuns}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Tempo Estimado</span>
          <span className="summary-value">{summary.completionTime}min</span>
        </div>
      </div>

      <div className="debug-table">
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Custo</th>
              <th>Gold/Rodada</th>
              <th>Rodadas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr 
                key={stat.level}
                className={`
                  ${stat.isUnlocked ? 'unlocked' : 'locked'}
                  ${stat.canAfford ? 'affordable' : ''}
                  ${stat.level === currentRoom + 1 ? 'current' : ''}
                `}
              >
                <td>{stat.level}</td>
                <td className="cost-cell">
                  {stat.unlockCost === 0 ? '—' : stat.unlockCost}
                </td>
                <td>{stat.expectedGold}</td>
                <td className={
                  stat.runsNeeded <= 3 ? 'good' : 
                  stat.runsNeeded <= 8 ? 'ok' : 
                  'hard'
                }>
                  {stat.runsNeeded === 0 ? '—' : stat.runsNeeded}
                </td>
                <td>
                  {stat.level <= currentRoom + 1 ? '✅' : 
                   stat.canAfford ? '🔓' : '🔒'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="debug-legend">
        <span className="legend-item">
          <span className="legend-color good"></span> ≤3 rodadas
        </span>
        <span className="legend-item">
          <span className="legend-color ok"></span> 4-8 rodadas
        </span>
        <span className="legend-item">
          <span className="legend-color hard"></span> 9+ rodadas
        </span>
      </div>
    </div>
  )
}

export default ProgressionDebug
