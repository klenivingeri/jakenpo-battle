/**
 * Gera a configuração de todas as rooms do jogo
 * @param {number} roomCurrent - Índice da room atual desbloqueada (0-based)
 * @param {object} options - Opções de configuração para modos especiais
 * @param {boolean} options.isChaosMode - Se é modo caos (mais rápido)
 * @returns {Array} Array com configuração de 100 rooms
 */
export const generateRooms = (roomCurrent = 0, options = {}) => {
  const { isChaosMode = false } = options;
  
  return Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;

    // Calcula qual ciclo de 20 rooms estamos (0-19, 20-39, 40-59, etc.)
    const cycleIndex = i % 10; // 0 a 19 dentro do ciclo

    // Progressão contínua de velocidade e spawn
    // Velocidade base aumenta com o nível
    let baseSpeed = 2 + (Math.floor(Math.min(i, 29) / 2) * 0.06);
    
    // Spawn interval diminui com o nível (fica mais rápido) - RESETA A CADA 20 ROOMS
    let baseSpawnInterval = Math.max(600, 3000 - (cycleIndex * 24));

    // Modo caos é mais rápido e intenso
    if (isChaosMode) {
      baseSpeed = 2.5 + (Math.floor(i / 2) * 0.075);
      baseSpawnInterval = Math.max(400, 2500 - (cycleIndex * 21));
    }

    // Sistema de drops de raridade baseado no nível
    const progressFactor = Math.min(i / 99, 1); // 0 a 1
    
    const commonDrop = Math.max(10, 100 - (progressFactor * 60)); // 100 -> 40
    const uncommonDrop = Math.min(30, progressFactor * 30); // 0 -> 30
    const rareDrop = Math.min(20, progressFactor * 20); // 0 -> 20
    const heroicDrop = Math.min(15, progressFactor * 15); // 0 -> 15
    const legendaryDrop = Math.min(10, progressFactor * 10); // 0 -> 10
    const mythicDrop = Math.min(8, progressFactor * 8); // 0 -> 8
    const immortalDrop = Math.min(7, progressFactor * 7); // 0 -> 7
    
    // Normalizar para somar 100
    const total = commonDrop + uncommonDrop + rareDrop + heroicDrop + legendaryDrop + mythicDrop + immortalDrop;
    
    const enemyConfig = {
      common: { drop: (commonDrop / total) * 100 },
      uncommon: { drop: (uncommonDrop / total) * 100 },
      rare: { drop: (rareDrop / total) * 100 },
      heroic: { drop: (heroicDrop / total) * 100 },
      legendary: { drop: (legendaryDrop / total) * 100 },
      mythic: { drop: (mythicDrop / total) * 100 },
      immortal: { drop: (immortalDrop / total) * 100 }
    };

    let bulletsPerAction = 1;
    if (level >= 15) bulletsPerAction = 2;
    if (level >= 50) bulletsPerAction = 3;
    if (level >= 85) bulletsPerAction = 4;
    if (level >= 120) bulletsPerAction = 5;
    if (level >= 155) bulletsPerAction = 6;
    if (level >= 179) bulletsPerAction = 7;

    return {
      id: level,
      gameDuration: 30 + Math.floor(i / 3),
      speed: baseSpeed,
      spawnInterval: baseSpawnInterval,
      bulletsPerAction: bulletsPerAction,
      disableButton: i > roomCurrent,
      enemy: enemyConfig,
      ...(isChaosMode && { isChaosMode: true })
    };
  });
};
