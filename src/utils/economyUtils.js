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
  MIN_RUNS_MULTIPLIER: 2.0,
  
  // Fator de escalamento de gold por fase
  GOLD_SCALE_FACTOR: 0.15,
  GOLD_BASE_MULTIPLIER: 1.0
}

/**
 * Calcula o multiplicador de gold baseado no nível da fase
 * Gold aumenta gradualmente conforme avança nas fases
 * 
 * @param {number} level - Nível da fase (1-100)
 * @returns {number} Multiplicador de gold
 */
export const calculateGoldMultiplier = (level) => {
  const { GOLD_SCALE_FACTOR, GOLD_BASE_MULTIPLIER } = ECONOMY_CONFIG
  
  // Fórmula: 1.0 + (level - 1) * 0.15
  // Fase 1: 1.0x
  // Fase 10: 2.35x
  // Fase 20: 3.85x
  // Fase 50: 8.35x
  // Fase 100: 15.85x
  return GOLD_BASE_MULTIPLIER + ((level - 1) * GOLD_SCALE_FACTOR)
}

/**
 * Calcula o gold que um bullet deve dar baseado na raridade e nível da fase
 * 
 * @param {string} rarity - Raridade do bullet (common, uncommon, rare, etc.)
 * @param {number} level - Nível da fase atual
 * @returns {number} Quantidade de gold
 */
export const calculateBulletGold = (rarity, level) => {
  // Valores base por raridade
  const baseGold = {
    common: 1,
    uncommon: 2,
    rare: 3,
    heroic: 4,
    legendary: 5,
    mythic: 6,
    immortal: 7
  }
  
  const base = baseGold[rarity] || 1
  const multiplier = calculateGoldMultiplier(level)
  
  return Math.floor(base * multiplier)
}

/**
 * Calcula o custo para desbloquear uma fase
 * 
 * @param {number} level - Nível da fase (1-100)
 * @param {object} currentLevelConfig - Configuração da fase ATUAL (não a anterior)
 * @returns {number} Custo em gold para desbloquear
 * 
 * O custo para desbloquear a PRÓXIMA fase é baseado no gold que você ganha na fase ATUAL
 */
export const calculateUnlockCost = (level, currentLevelConfig = null) => {
  if (level === 1) return 0 // Primeira fase sempre desbloqueada
  
  // Se temos configuração da fase ATUAL, calcula baseado no gold esperado dela
  if (currentLevelConfig) {
    const expectedGold = calculateExpectedGold(
      currentLevelConfig.enemy,
      level,
      currentLevelConfig.gameDuration,
      currentLevelConfig.spawnInterval
    )
    
    // Custo = gold esperado da fase atual * MIN_RUNS_MULTIPLIER (2x por padrão)
    return Math.floor(expectedGold * ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER)
  }
  
  // Fallback para cálculo simples se não tiver configuração
  const { BASE_MULTIPLIER, EXPONENT, LINEAR_BONUS } = ECONOMY_CONFIG
  const exponentialPart = BASE_MULTIPLIER * Math.pow(level, EXPONENT)
  const linearPart = LINEAR_BONUS * level
  
  return Math.floor(exponentialPart + linearPart)
}

/**
 * Calcula o gold médio esperado por rodada em uma fase
 * Baseado nas chances de raridade e número médio de inimigos
 * 
 * @param {object} dropConfig - Configuração de drops da fase
 * @param {number} level - Nível da fase
 * @param {number} gameDuration - Duração da fase em segundos
 * @param {number} spawnInterval - Intervalo de spawn em ms
 * @returns {number} Gold médio esperado
 */
export const calculateExpectedGold = (dropConfig, level, gameDuration = 30, spawnInterval = 2000) => {
  // Número médio de inimigos por fase
  const averageEnemies = Math.floor((gameDuration * 1000) / spawnInterval)
  
  // Calcula gold médio ponderado usando o novo sistema escalado
  let weightedGold = 0
  Object.keys(dropConfig).forEach(rarity => {
    const dropChance = (dropConfig[rarity]?.drop || 0) / 100
    const goldValue = calculateBulletGold(rarity, level)
    weightedGold += dropChance * goldValue
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
  const expectedGold = calculateExpectedGold(dropConfig, level, gameDuration, spawnInterval)
  const runsNeeded = expectedGold > 0 ? Math.ceil(unlockCost / expectedGold) : 0
  
  return {
    level,
    unlockCost,
    expectedGold,
    runsNeeded,
    goldMultiplier: calculateGoldMultiplier(level).toFixed(2) + 'x',
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
