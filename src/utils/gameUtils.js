import { BULLET_TYPES } from '../constants/gameConfig'

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

// Escolhe um tipo de bullet aleatório, evitando repetir mais de 2 vezes seguidas
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

// Cria uma nova entidade bullet
export const createBullet = (type, x, y, width, height) => ({
  type,
  x,
  y,
  width,
  height,
  active: true,
  id: Date.now() + Math.random(),
  createdAt: performance.now(),
  lastParticleY: y
})

// Atualiza a posição e escala de um bullet baseado no tempo
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
