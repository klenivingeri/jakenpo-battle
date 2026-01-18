import { BULLET_TYPES } from '../constants/gameConfig'
import bulletAttributesData from '../data/bullet_attributes.json'

// Converte array em objeto para acesso mais rápido
const bulletAttributes = bulletAttributesData.reduce((acc, attr) => {
  acc[attr.id] = attr
  return acc
}, {})

// Verifica colisão entre dois objetos
export const checkCollision = (a, b) => 
  a.x < b.x + b.width && 
  a.x + a.width > b.x && 
  a.y < b.y + b.height && 
  a.y + a.height > b.y

// Determina o resultado de uma batalha pedra, papel, tesoura
export const getGameResult = (playerChoice, enemyChoice) => {
  if (playerChoice === enemyChoice) return 'draw'
  
  const winConditions = {
    [BULLET_TYPES.PEDRA]: BULLET_TYPES.TESOURA,
    [BULLET_TYPES.PAPEL]: BULLET_TYPES.PEDRA,
    [BULLET_TYPES.TESOURA]: BULLET_TYPES.PAPEL
  }
  
  return winConditions[playerChoice] === enemyChoice ? 'win' : 'loss'
}

// Escolhe um tipo de bala aleatório, evitando repetir mais de 2 vezes seguidas
export const selectRandomBulletType = (previousBullets = [], allTypes) => {
  let newType
  do {
    newType = allTypes[Math.floor(Math.random() * allTypes.length)]
  } while (
    previousBullets.length > 1 &&
    previousBullets.slice(-2).every(b => b.type === newType)
  )
  return newType
}

// Sorteia uma raridade baseado nas chances de drop
export const selectBulletRarity = (dropConfig) => {
  const rand = Math.random() * 100
  let cumulative = 0
  
  const rarities = ['common', 'uncommon', 'rare', 'heroic', 'legendary', 'mythic', 'immortal']
  
  for (const rarity of rarities) {
    cumulative += dropConfig[rarity].drop
    if (rand <= cumulative) {
      return rarity
    }
  }
  
  return 'common' // fallback
}

// Cria uma nova entidade de bala
export const createBullet = (type, x, y, width, height, rarity = 'common') => {
  const attributes = bulletAttributes[rarity]
  
  return {
    type,
    x,
    y,
    width,
    height,
    active: true,
    id: Date.now() + Math.random(),
    createdAt: performance.now(),
    lastParticleY: y,
    rarity,
    hp: attributes.enemyHp,
    maxHp: attributes.enemyHp,
    atk: attributes.enemyAtk,
    color: attributes.color,
    gold: attributes.gold
  }
}

// Atualiza a posição e escala de uma bala baseado no tempo
export const updateBulletTransform = (bullet, deltaY, now, canvasWidth, animationDuration) => {
  bullet.y += deltaY
  
  const age = now - bullet.createdAt
  const scale = Math.min(1, age / animationDuration)
  const currentSize = 50 * scale

  bullet.x = (canvasWidth / 2) - (currentSize / 2)
  bullet.width = currentSize
  bullet.height = currentSize
}

// Cria uma partícula
export const createParticle = (x, y) => ({
  x,
  y,
  createdAt: performance.now(),
  id: Math.random()
})

// Cria uma explosão
export const createExplosion = (x, y) => ({
  x,
  y,
  anim: 0,
  id: Date.now() + Math.random(),
  animCounter: 0,
  animDelay: 2
})

// Desenha a barra de HP segmentada
export const drawHPBar = (context, bullet, offsetY = 0) => {
  const barMaxWidth = 32
  const barHeight = 8
  const blockGap = 2
  const totalBlocks = Math.ceil(bullet.maxHp)
  const blockWidth = (barMaxWidth - (totalBlocks - 1) * blockGap) / totalBlocks
  
  const barX = bullet.x + bullet.width / 2 - barMaxWidth / 2
  const barY = bullet.y + bullet.height + offsetY
  
  // Número de blocos cheios
  const filledBlocks = Math.ceil(bullet.hp)
  
  for (let i = 0; i < totalBlocks; i++) {
    const x = barX + i * (blockWidth + blockGap)
    
    if (i < filledBlocks) {
      // Bloco cheio
      context.fillStyle = bullet.color || '#95a5a6'
      context.fillRect(x, barY, blockWidth, barHeight)
      
      // Borda
      context.strokeStyle = '#000'
      context.lineWidth = 1
      context.strokeRect(x, barY, blockWidth, barHeight)
    } else {
      // Bloco vazio
      context.fillStyle = '#333'
      context.fillRect(x, barY, blockWidth, barHeight)
      
      // Borda
      context.strokeStyle = '#000'
      context.lineWidth = 1
      context.strokeRect(x, barY, blockWidth, barHeight)
    }
  }
}
