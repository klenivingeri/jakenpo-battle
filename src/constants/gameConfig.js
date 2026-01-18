// Tipos de balas/armas
export const BULLET_TYPES = {
  PEDRA: 'pedra',
  PAPEL: 'papel',
  TESOURA: 'tesoura'
}

// Array de todos os tipos
export const ALL_BULLET_TYPES = Object.values(BULLET_TYPES)

// Configuração das balas
export const BULLET_CONFIG = {
  [BULLET_TYPES.PEDRA]: {
    label: 'Pedra',
    image: '/assets/1_pedra.png',
    logo: '/assets/1_pedra.png'
  },
  [BULLET_TYPES.PAPEL]: {
    label: 'Papel',
    image: '/assets/2_papel.png',
    logo: '/assets/2_papel.png'
  },
  [BULLET_TYPES.TESOURA]: {
    label: 'Tesoura',
    image: '/assets/3_tesoura.png',
    logo: '/assets/3_tesoura.png'
  }
}

// Imagens do jogo
export const GAME_IMAGES = {
  EXPLOSION: '/assets/explosao.png'
}

// Sons do jogo
export const GAME_SOUNDS = {
  EXPLOSION: '/assets/song/song-explosion.mp3'
}

// Configurações padrão do jogo
export const DEFAULT_GAME_CONFIG = {
  GAME_DURATION: 30,
  BULLET_SPEED: 2,
  SPAWN_INTERVAL: 2000,
  BULLET_SIZE: 50,
  ANIMATION_DURATION: 200,
  PARTICLE_LIFETIME: 500,
  PARTICLE_SPAWN_DISTANCE: 20
}
