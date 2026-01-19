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

// Utilitários de armazenamento (localStorage)
export {
  STORAGE_KEYS,
  DEFAULT_PLAYER_REGISTRY,
  getFromStorage,
  saveToStorage,
  getPlayerRegistry,
  savePlayerRegistry,
  getEquippedSkills,
  getEquippedBackground,
  updatePlayerGold,
  addPlayerXP,
  purchaseSkill,
  equipSkill,
  purchaseBackground,
  equipBackground,
  getIsMusicOn,
  setIsMusicOn,
  getRoomCurrent,
  setRoomCurrent,
  getGameStats,
  setGameStats,
  getRoomStars,
  setRoomStars
} from './storageUtils'

