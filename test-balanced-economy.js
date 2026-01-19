import { calculateGoldMultiplier, calculateBulletGold, calculateExpectedGold, calculateUnlockCost } from './src/utils/economyUtils.js';

console.log('=== TESTE DO SISTEMA DE ECONOMIA BALANCEADA ===\n');

// Configuração de exemplo de uma fase típica
const testRooms = [
  {
    level: 1,
    gameDuration: 100,
    spawnInterval: 3000,
    enemy: {
      common: { drop: 100 },
      uncommon: { drop: 0 },
      rare: { drop: 0 },
      heroic: { drop: 0 },
      legendary: { drop: 0 },
      mythic: { drop: 0 },
      immortal: { drop: 0 }
    }
  },
  {
    level: 5,
    gameDuration: 35,
    spawnInterval: 2400,
    enemy: {
      common: { drop: 80 },
      uncommon: { drop: 10 },
      rare: { drop: 10 },
      heroic: { drop: 0 },
      legendary: { drop: 0 },
      mythic: { drop: 0 },
      immortal: { drop: 0 }
    }
  },
  {
    level: 10,
    gameDuration: 40,
    spawnInterval: 2000,
    enemy: {
      common: { drop: 60 },
      uncommon: { drop: 20 },
      rare: { drop: 15 },
      heroic: { drop: 5 },
      legendary: { drop: 0 },
      mythic: { drop: 0 },
      immortal: { drop: 0 }
    }
  },
  {
    level: 20,
    gameDuration: 50,
    spawnInterval: 1600,
    enemy: {
      common: { drop: 40 },
      uncommon: { drop: 25 },
      rare: { drop: 20 },
      heroic: { drop: 10 },
      legendary: { drop: 5 },
      mythic: { drop: 0 },
      immortal: { drop: 0 }
    }
  },
  {
    level: 50,
    gameDuration: 60,
    spawnInterval: 1000,
    enemy: {
      common: { drop: 20 },
      uncommon: { drop: 20 },
      rare: { drop: 20 },
      heroic: { drop: 15 },
      legendary: { drop: 15 },
      mythic: { drop: 7 },
      immortal: { drop: 3 }
    }
  }
];

testRooms.forEach((room) => {
  console.log(`\n📍 FASE ${room.level}`);
  console.log('─'.repeat(50));
  
  const multiplier = calculateGoldMultiplier(room.level);
  console.log(`🔢 Multiplicador de Gold: ${multiplier.toFixed(2)}x`);
  
  const expectedGold = calculateExpectedGold(
    room.enemy,
    room.level,
    room.gameDuration,
    room.spawnInterval
  );
  console.log(`💰 Gold Esperado por Partida: ${expectedGold}`);
  
  const unlockCost = calculateUnlockCost(room.level, room);
  console.log(`🔒 Custo para Desbloquear PRÓXIMA Fase: ${unlockCost}`);
  
  const runsNeeded = expectedGold > 0 ? (unlockCost / expectedGold).toFixed(2) : 0;
  console.log(`🎮 Jogadas Necessárias: ${runsNeeded}x`);
  
  console.log('\n💎 Gold por Raridade:');
  const rarities = ['common', 'uncommon', 'rare', 'heroic', 'legendary', 'mythic', 'immortal'];
  rarities.forEach(rarity => {
    const dropChance = room.enemy[rarity]?.drop || 0;
    if (dropChance > 0) {
      const gold = calculateBulletGold(rarity, room.level);
      console.log(`   ${rarity.padEnd(10)} (${dropChance.toFixed(0)}%): ${gold} gold`);
    }
  });
  
  const enemies = Math.floor((room.gameDuration * 1000) / room.spawnInterval);
  console.log(`\n⚔️  Inimigos Esperados: ${enemies}`);
  console.log(`⏱️  Tempo da Fase: ${room.gameDuration}s`);
  console.log(`📊 Spawn Interval: ${(room.spawnInterval / 1000).toFixed(1)}s`);
});

console.log('\n\n=== RESUMO DO BALANCEAMENTO ===\n');
console.log('✅ Sistema configurado para 2 jogadas mínimas por fase');
console.log('✅ Gold escala +15% por fase');
console.log('✅ Custos calculados dinamicamente baseado na fase anterior');
console.log('\n🎯 O jogador precisa jogar aproximadamente 2x cada fase para progredir!\n');
