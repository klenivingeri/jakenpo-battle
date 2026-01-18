// Utilitários de jogo
export {
  checkCollision,
  getGameResult,
  selectRandomBulletType,
  createBullet,
  updateBulletTransform,
  createParticle,
  createExplosion
} from './gameUtils'

// Utilitários de economia
export {
  calculateUnlockCost,
  calculateExpectedGold,
  canUnlockRoom,
  getProgressionStats,
  generateProgressionTable,
  updateEconomyConfig,
  ECONOMY_CONFIG
} from './economyUtils'
