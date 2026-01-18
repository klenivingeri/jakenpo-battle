/**
 * Sistema de Economia e Progressão
 * 
 * Calcula custos de desbloqueio de fases baseado em:
 * - Nível da fase
 * - Gold esperado por rodada
 * - Necessidade de 3+ rodadas para progressão
 */

/**
 * Parâmetros do sistema econômico
 * Ajuste estes valores para calibrar a progressão
 */
export const ECONOMY_CONFIG = {
  // Multiplicador base da curva exponencial (reduzido para ~40% do original)
  BASE_MULTIPLIER: 6,
  
  // Expoente da curva (reduzido para progressão mais suave)
  EXPONENT: 1.2,
  
  // Bônus linear por nível (reduzido)
  LINEAR_BONUS: 2,
  
  // Multiplicador de segurança (quantas rodadas mínimas)
  MIN_RUNS_MULTIPLIER: 2.0
}

/**
 * Calcula o custo para desbloquear uma fase
 * 
 * @param {number} level - Nível da fase (1-100)
 * @returns {number} Custo em gold para desbloquear
 * 
 * Fórmula: unlockCost = baseMultiplier × level^exponent + linearBonus × level
 */
export const calculateUnlockCost = (level) => {
  const { BASE_MULTIPLIER, EXPONENT, LINEAR_BONUS } = ECONOMY_CONFIG
  
  if (level === 1) return 0 // Primeira fase sempre desbloqueada
  
  const exponentialPart = BASE_MULTIPLIER * Math.pow(level, EXPONENT)
  const linearPart = LINEAR_BONUS * level
  
  return Math.floor(exponentialPart + linearPart)
}

/**
 * Calcula o gold médio esperado por rodada em uma fase
 * Baseado nas chances de raridade e número médio de inimigos
 * 
 * @param {object} dropConfig - Configuração de drops da fase
 * @param {number} gameDuration - Duração da fase em segundos
 * @param {number} spawnInterval - Intervalo de spawn em ms
 * @returns {number} Gold médio esperado
 */
export const calculateExpectedGold = (dropConfig, gameDuration = 30, spawnInterval = 2000) => {
  // Gold por raridade (deve coincidir com bullet_attributes.json)
  const goldByRarity = {
    common: 1,
    uncommon: 2,
    rare: 3,
    heroic: 4,
    legendary: 5,
    mythic: 6,
    immortal: 7
  }
  
  // Número médio de inimigos por fase
  const averageEnemies = Math.floor((gameDuration * 1000) / spawnInterval)
  
  // Calcula gold médio ponderado
  let weightedGold = 0
  Object.keys(goldByRarity).forEach(rarity => {
    const dropChance = (dropConfig[rarity]?.drop || 0) / 100
    weightedGold += dropChance * goldByRarity[rarity]
  })
  
  return Math.floor(weightedGold * averageEnemies)
}

/**
 * Verifica se o jogador tem gold suficiente para desbloquear uma fase
 * 
 * @param {number} playerGold - Gold atual do jogador
 * @param {number} level - Nível da fase a desbloquear
 * @returns {boolean} True se pode desbloquear
 */
export const canUnlockRoom = (playerGold, level) => {
  const cost = calculateUnlockCost(level)
  return playerGold >= cost
}

/**
 * Calcula estatísticas de progressão para debug/balanceamento
 * 
 * @param {number} level - Nível da fase
 * @param {object} dropConfig - Configuração de drops
 * @param {number} gameDuration - Duração da fase
 * @param {number} spawnInterval - Intervalo de spawn
 * @returns {object} Estatísticas detalhadas
 */
export const getProgressionStats = (level, dropConfig, gameDuration, spawnInterval) => {
  const unlockCost = calculateUnlockCost(level)
  const expectedGold = calculateExpectedGold(dropConfig, gameDuration, spawnInterval)
  const runsNeeded = Math.ceil(unlockCost / expectedGold)
  
  return {
    level,
    unlockCost,
    expectedGold,
    runsNeeded,
    efficiency: (runsNeeded / ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER * 100).toFixed(1) + '%'
  }
}

/**
 * Gera tabela de progressão para todos os níveis (útil para balanceamento)
 * 
 * @param {array} rooms - Array de todas as salas
 * @returns {array} Tabela de progressão
 */
export const generateProgressionTable = (rooms) => {
  return rooms.map(room => {
    const stats = getProgressionStats(
      room.id,
      room.enemy,
      room.gameDuration,
      room.spawnInterval
    )
    return {
      level: stats.level,
      unlockCost: stats.unlockCost,
      expectedGold: stats.expectedGold,
      runsNeeded: stats.runsNeeded
    }
  })
}

/**
 * Ajusta os parâmetros econômicos dinamicamente
 * Use para rebalancear o jogo sem alterar código
 * 
 * @param {object} newConfig - Novos parâmetros
 */
export const updateEconomyConfig = (newConfig) => {
  Object.assign(ECONOMY_CONFIG, newConfig)
}
