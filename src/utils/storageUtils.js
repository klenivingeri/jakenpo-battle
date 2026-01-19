/**
 * Utilitários centralizados para gerenciamento do localStorage
 * Evita duplicação de código e mantém consistência
 */

// Chaves do localStorage
export const STORAGE_KEYS = {
  PLAYER_REGISTRY: 'playerRegistry',
  ROOM_CURRENT: 'roomCurrent',
  GAME_STATS: 'gameStats',
  ROOM_STARS: 'roomStars',
  IS_MUSIC_ON: 'isMusicOn',
  ECONOMY_HISTORY: 'economyHistory'
};

// Registry padrão do jogador
export const DEFAULT_PLAYER_REGISTRY = {
  gold: 0,
  xp: 0,
  level: 1,
  currentSkins: {
    pedra: '/assets/1_pedra.png',
    papel: '/assets/2_papel.png',
    tesoura: '/assets/3_tesoura.png'
  },
  trailColor: 'white',
  ownedBackgrounds: ['/assets/background/vila.gif'],
  equippedBackground: '/assets/background/vila.gif',
  ownedSkills: {
    pedra: ['/assets/1_pedra.png'],
    papel: ['/assets/2_papel.png'],
    tesoura: ['/assets/3_tesoura.png'],
    calda: ['#95a5a6']
  },
  equippedSkills: {
    pedra: '/assets/1_pedra.png',
    papel: '/assets/2_papel.png',
    tesoura: '/assets/3_tesoura.png',
    calda: '#95a5a6'
  }
};

/**
 * Obtém um item do localStorage com parse JSON
 * @param {string} key - Chave do localStorage
 * @param {*} defaultValue - Valor padrão se não existir
 * @returns {*} Valor parseado ou padrão
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Salva um item no localStorage com stringify JSON
 * @param {string} key - Chave do localStorage
 * @param {*} value - Valor a ser salvo
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
  }
};

/**
 * Obtém o registry do jogador do localStorage
 * Garante que todas as propriedades existam
 * @returns {Object} Player registry completo
 */
export const getPlayerRegistry = () => {
  const saved = getFromStorage(STORAGE_KEYS.PLAYER_REGISTRY);
  
  if (saved) {
    return {
      ...DEFAULT_PLAYER_REGISTRY,
      ...saved,
      ownedBackgrounds: saved.ownedBackgrounds || DEFAULT_PLAYER_REGISTRY.ownedBackgrounds,
      equippedBackground: saved.equippedBackground || DEFAULT_PLAYER_REGISTRY.equippedBackground,
      ownedSkills: saved.ownedSkills || DEFAULT_PLAYER_REGISTRY.ownedSkills,
      equippedSkills: saved.equippedSkills || DEFAULT_PLAYER_REGISTRY.equippedSkills
    };
  }
  
  return DEFAULT_PLAYER_REGISTRY;
};

/**
 * Salva o registry do jogador no localStorage
 * @param {Object} registry - Player registry para salvar
 */
export const savePlayerRegistry = (registry) => {
  saveToStorage(STORAGE_KEYS.PLAYER_REGISTRY, registry);
};

/**
 * Obtém as skills equipadas do jogador
 * @returns {Object} Skills equipadas
 */
export const getEquippedSkills = () => {
  const registry = getPlayerRegistry();
  return registry.equippedSkills || DEFAULT_PLAYER_REGISTRY.equippedSkills;
};

/**
 * Obtém o background equipado do jogador
 * @returns {string} Caminho do background equipado
 */
export const getEquippedBackground = () => {
  const registry = getPlayerRegistry();
  return registry.equippedBackground || DEFAULT_PLAYER_REGISTRY.equippedBackground;
};

/**
 * Atualiza o gold do jogador
 * @param {number} goldChange - Quantidade de gold a adicionar/remover
 * @returns {Object} Registry atualizado
 */
export const updatePlayerGold = (goldChange) => {
  const registry = getPlayerRegistry();
  const updatedRegistry = {
    ...registry,
    gold: Math.max(0, registry.gold + goldChange)
  };
  savePlayerRegistry(updatedRegistry);
  return updatedRegistry;
};

/**
 * Adiciona XP e atualiza o nível do jogador
 * @param {number} xpGain - Quantidade de XP a adicionar
 * @returns {Object} Registry atualizado com informação de level up
 */
export const addPlayerXP = (xpGain) => {
  const registry = getPlayerRegistry();
  let newXP = registry.xp + xpGain;
  let newLevel = registry.level;
  let leveledUp = false;

  // Verifica level up
  while (newXP >= newLevel * 100) {
    newXP -= newLevel * 100;
    newLevel++;
    leveledUp = true;
  }

  const updatedRegistry = {
    ...registry,
    xp: newXP,
    level: newLevel
  };

  savePlayerRegistry(updatedRegistry);
  return { registry: updatedRegistry, leveledUp };
};

/**
 * Compra e adiciona uma skill/item ao inventário
 * @param {string} category - Categoria (pedra, papel, tesoura, calda)
 * @param {string} itemId - ID do item
 * @param {number} price - Preço do item
 * @returns {Object|null} Registry atualizado ou null se falhar
 */
export const purchaseSkill = (category, itemId, price) => {
  const registry = getPlayerRegistry();
  
  // Verifica se tem gold suficiente e ainda não possui
  if (registry.gold < price || registry.ownedSkills[category]?.includes(itemId)) {
    return null;
  }

  const updatedRegistry = {
    ...registry,
    gold: registry.gold - price,
    ownedSkills: {
      ...registry.ownedSkills,
      [category]: [...(registry.ownedSkills[category] || []), itemId]
    }
  };

  savePlayerRegistry(updatedRegistry);
  return updatedRegistry;
};

/**
 * Equipa uma skill
 * @param {string} category - Categoria (pedra, papel, tesoura, calda)
 * @param {string} itemId - ID do item
 * @returns {Object} Registry atualizado
 */
export const equipSkill = (category, itemId) => {
  const registry = getPlayerRegistry();
  
  const updatedRegistry = {
    ...registry,
    equippedSkills: {
      ...registry.equippedSkills,
      [category]: itemId
    }
  };

  savePlayerRegistry(updatedRegistry);
  // Dispara evento para atualizar componentes
  window.dispatchEvent(new Event('skillsChanged'));
  return updatedRegistry;
};

/**
 * Compra e adiciona um background ao inventário
 * @param {string} bgPath - Caminho do background
 * @param {number} price - Preço do background
 * @returns {Object|null} Registry atualizado ou null se falhar
 */
export const purchaseBackground = (bgPath, price) => {
  const registry = getPlayerRegistry();
  
  if (registry.gold < price || registry.ownedBackgrounds?.includes(bgPath)) {
    return null;
  }

  const updatedRegistry = {
    ...registry,
    gold: registry.gold - price,
    ownedBackgrounds: [...(registry.ownedBackgrounds || []), bgPath]
  };

  savePlayerRegistry(updatedRegistry);
  return updatedRegistry;
};

/**
 * Equipa um background
 * @param {string} bgPath - Caminho do background
 * @returns {Object} Registry atualizado
 */
export const equipBackground = (bgPath) => {
  const registry = getPlayerRegistry();
  
  const updatedRegistry = {
    ...registry,
    equippedBackground: bgPath
  };

  savePlayerRegistry(updatedRegistry);
  // Dispara evento para atualizar componentes
  window.dispatchEvent(new Event('backgroundChanged'));
  return updatedRegistry;
};

/**
 * Obtém o estado da música
 * @returns {boolean} Se a música está ligada
 */
export const getIsMusicOn = () => {
  return getFromStorage(STORAGE_KEYS.IS_MUSIC_ON, true);
};

/**
 * Salva o estado da música
 * @param {boolean} isOn - Se a música está ligada
 */
export const setIsMusicOn = (isOn) => {
  saveToStorage(STORAGE_KEYS.IS_MUSIC_ON, isOn);
};

/**
 * Obtém a sala atual
 * @returns {number} Número da sala atual
 */
export const getRoomCurrent = () => {
  return getFromStorage(STORAGE_KEYS.ROOM_CURRENT, 0);
};

/**
 * Salva a sala atual
 * @param {number} room - Número da sala
 */
export const setRoomCurrent = (room) => {
  saveToStorage(STORAGE_KEYS.ROOM_CURRENT, room);
};

/**
 * Obtém as estatísticas do jogo
 * @returns {Object} Estatísticas do jogo
 */
export const getGameStats = () => {
  return getFromStorage(STORAGE_KEYS.GAME_STATS, { 
    wins: 0, 
    losses: 0, 
    draws: 0, 
    result: '' 
  });
};

/**
 * Salva as estatísticas do jogo
 * @param {Object} stats - Estatísticas do jogo
 */
export const setGameStats = (stats) => {
  saveToStorage(STORAGE_KEYS.GAME_STATS, stats);
};

/**
 * Obtém as estrelas das salas
 * @returns {Array} Array com estrelas de cada sala
 */
export const getRoomStars = () => {
  return getFromStorage(STORAGE_KEYS.ROOM_STARS, Array(100).fill(0));
};

/**
 * Salva as estrelas das salas
 * @param {Array} stars - Array com estrelas
 */
export const setRoomStars = (stars) => {
  saveToStorage(STORAGE_KEYS.ROOM_STARS, stars);
};
