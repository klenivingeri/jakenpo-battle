/**
 * Script de Teste de Balanceamento Econômico
 * Execute com: node test-economy.js
 */

import { 
  calculateUnlockCost, 
  calculateExpectedGold,
  getProgressionStats,
  generateProgressionTable,
  ECONOMY_CONFIG 
} from './src/utils/economyUtils.js'

console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║     TESTE DE BALANCEAMENTO - EMOJI BATTLE ECONOMY         ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

console.log('📊 CONFIGURAÇÃO ATUAL:')
console.log(`   Base Multiplier: ${ECONOMY_CONFIG.BASE_MULTIPLIER}`)
console.log(`   Exponent: ${ECONOMY_CONFIG.EXPONENT}`)
console.log(`   Linear Bonus: ${ECONOMY_CONFIG.LINEAR_BONUS}`)
console.log(`   Min Runs: ${ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER}x\n`)

// Simula configurações de drop para diferentes estágios do jogo
const dropConfigs = {
  early: {  // Fases 1-20
    common: { drop: 90 },
    uncommon: { drop: 7 },
    rare: { drop: 2 },
    heroic: { drop: 0.8 },
    legendary: { drop: 0.15 },
    mythic: { drop: 0.04 },
    immortal: { drop: 0.01 }
  },
  mid: {  // Fases 40-60
    common: { drop: 55 },
    uncommon: { drop: 25 },
    rare: { drop: 12 },
    heroic: { drop: 5 },
    legendary: { drop: 2 },
    mythic: { drop: 0.8 },
    immortal: { drop: 0.2 }
  },
  late: {  // Fases 80-100
    common: { drop: 40 },
    uncommon: { drop: 28 },
    rare: { drop: 17 },
    heroic: { drop: 9 },
    legendary: { drop: 4 },
    mythic: { drop: 1.5 },
    immortal: { drop: 0.5 }
  }
}

console.log('═══════════════════════════════════════════════════════════════')
console.log('  📈 ANÁLISE DE PROGRESSÃO POR FASES')
console.log('═══════════════════════════════════════════════════════════════\n')

const testLevels = [
  { level: 1, stage: 'early', label: 'Tutorial' },
  { level: 5, stage: 'early', label: 'Iniciante' },
  { level: 10, stage: 'early', label: 'Novato' },
  { level: 20, stage: 'early', label: 'Intermediário' },
  { level: 30, stage: 'mid', label: 'Avançado' },
  { level: 40, stage: 'mid', label: 'Experiente' },
  { level: 50, stage: 'mid', label: 'Veterano' },
  { level: 60, stage: 'mid', label: 'Elite' },
  { level: 70, stage: 'late', label: 'Mestre' },
  { level: 80, stage: 'late', label: 'Grão-Mestre' },
  { level: 90, stage: 'late', label: 'Lendário' },
  { level: 100, stage: 'late', label: 'Imortal' }
]

testLevels.forEach(({ level, stage, label }) => {
  const cost = calculateUnlockCost(level)
  const expectedGold = calculateExpectedGold(dropConfigs[stage], 30, 2000)
  const runsNeeded = cost === 0 ? 0 : Math.ceil(cost / expectedGold)
  const efficiency = cost === 0 ? 'N/A' : ((runsNeeded / ECONOMY_CONFIG.MIN_RUNS_MULTIPLIER) * 100).toFixed(0) + '%'
  
  console.log(`🎮 FASE ${level.toString().padStart(3)} - ${label}`)
  console.log(`   Custo: ${cost.toString().padStart(5)} gold`)
  console.log(`   Gold/rodada: ~${expectedGold.toString().padStart(2)}`)
  console.log(`   Rodadas necessárias: ${runsNeeded.toString().padStart(2)}`)
  console.log(`   Eficiência: ${efficiency}`)
  
  // Alertas de balanceamento
  if (runsNeeded > 20 && level < 50) {
    console.log(`   ⚠️  ALERTA: Muitas rodadas para fase inicial/média`)
  }
  if (runsNeeded < 2 && level > 10) {
    console.log(`   ⚠️  ALERTA: Muito fácil desbloquear`)
  }
  
  console.log()
})

console.log('═══════════════════════════════════════════════════════════════')
console.log('  💰 ANÁLISE DE CURVA DE CRESCIMENTO')
console.log('═══════════════════════════════════════════════════════════════\n')

// Calcula incremento percentual entre níveis
const growthAnalysis = [
  { from: 2, to: 5 },
  { from: 5, to: 10 },
  { from: 10, to: 20 },
  { from: 20, to: 30 },
  { from: 30, to: 50 },
  { from: 50, to: 70 },
  { from: 70, to: 90 },
  { from: 90, to: 100 }
]

growthAnalysis.forEach(({ from, to }) => {
  const costFrom = calculateUnlockCost(from)
  const costTo = calculateUnlockCost(to)
  const growth = ((costTo - costFrom) / costFrom * 100).toFixed(1)
  const avgPerLevel = ((costTo - costFrom) / (to - from)).toFixed(1)
  
  console.log(`Nível ${from} → ${to}:`)
  console.log(`   Custo: ${costFrom} → ${costTo} (+${growth}%)`)
  console.log(`   Média/nível: +${avgPerLevel} gold`)
  console.log()
})

console.log('═══════════════════════════════════════════════════════════════')
console.log('  🎯 ANÁLISE DE TEMPO DE JOGO')
console.log('═══════════════════════════════════════════════════════════════\n')

// Calcula tempo estimado para chegar em diferentes marcos
const calculatePlaytime = (targetLevel) => {
  let totalRuns = 0
  
  for (let level = 2; level <= targetLevel; level++) {
    const cost = calculateUnlockCost(level)
    const stage = level <= 20 ? 'early' : level <= 60 ? 'mid' : 'late'
    const expectedGold = calculateExpectedGold(dropConfigs[stage], 30, 2000)
    const runs = Math.ceil(cost / expectedGold)
    totalRuns += runs
  }
  
  const totalMinutes = (totalRuns * 30) / 60 // 30 segundos por rodada
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  
  return { totalRuns, hours, minutes }
}

const milestones = [10, 25, 50, 75, 100]

milestones.forEach(milestone => {
  const { totalRuns, hours, minutes } = calculatePlaytime(milestone)
  console.log(`Chegar na Fase ${milestone}:`)
  console.log(`   Total de rodadas: ${totalRuns}`)
  console.log(`   Tempo estimado: ${hours}h ${minutes}min`)
  console.log()
})

console.log('═══════════════════════════════════════════════════════════════')
console.log('  ✅ VALIDAÇÃO DE REQUISITOS')
console.log('═══════════════════════════════════════════════════════════════\n')

let validationsPassed = 0
let validationsTotal = 0

// Teste 1: Primeira fase sempre desbloqueada
validationsTotal++
const cost1 = calculateUnlockCost(1)
if (cost1 === 0) {
  console.log('✅ Fase 1 é gratuita')
  validationsPassed++
} else {
  console.log('❌ FALHA: Fase 1 deveria ser gratuita')
}

// Teste 2: Custos sempre crescentes
validationsTotal++
let isGrowing = true
for (let i = 1; i < 100; i++) {
  if (calculateUnlockCost(i + 1) <= calculateUnlockCost(i)) {
    isGrowing = false
    break
  }
}
if (isGrowing) {
  console.log('✅ Custos sempre crescentes')
  validationsPassed++
} else {
  console.log('❌ FALHA: Custos não crescem monotonicamente')
}

// Teste 3: Fases iniciais acessíveis (2-5 rodadas)
validationsTotal++
const earlyAccessible = testLevels.slice(0, 4).every(({ level, stage }) => {
  const cost = calculateUnlockCost(level)
  const expectedGold = calculateExpectedGold(dropConfigs[stage], 30, 2000)
  const runs = cost === 0 ? 0 : Math.ceil(cost / expectedGold)
  return runs <= 6
})
if (earlyAccessible) {
  console.log('✅ Fases iniciais acessíveis (≤6 rodadas)')
  validationsPassed++
} else {
  console.log('❌ FALHA: Fases iniciais muito caras')
}

// Teste 4: Último nível não absurdamente caro (≤25 rodadas)
validationsTotal++
const cost100 = calculateUnlockCost(100)
const gold100 = calculateExpectedGold(dropConfigs.late, 30, 2000)
const runs100 = Math.ceil(cost100 / gold100)
if (runs100 <= 25) {
  console.log(`✅ Fase 100 razoável (${runs100} rodadas)`)
  validationsPassed++
} else {
  console.log(`❌ FALHA: Fase 100 muito cara (${runs100} rodadas)`)
}

// Teste 5: Tempo total jogável (50-100 horas)
validationsTotal++
const { hours: totalHours } = calculatePlaytime(100)
if (totalHours >= 50 && totalHours <= 100) {
  console.log(`✅ Tempo total adequado (${totalHours}h)`)
  validationsPassed++
} else if (totalHours < 50) {
  console.log(`⚠️  Jogo muito curto (${totalHours}h)`)
} else {
  console.log(`⚠️  Jogo muito longo (${totalHours}h)`)
}

console.log()
console.log('═══════════════════════════════════════════════════════════════')
console.log(`  Validações: ${validationsPassed}/${validationsTotal} passaram`)
console.log('═══════════════════════════════════════════════════════════════\n')

if (validationsPassed === validationsTotal) {
  console.log('🎉 SISTEMA BALANCEADO E PRONTO PARA PRODUÇÃO!\n')
} else {
  console.log('⚠️  AJUSTES NECESSÁRIOS - Verifique ECONOMY_CONFIG\n')
}

// Gera CSV para análise em planilha
console.log('═══════════════════════════════════════════════════════════════')
console.log('  📊 EXPORTAÇÃO CSV (copie para Excel/Sheets)')
console.log('═══════════════════════════════════════════════════════════════\n')

console.log('Level,UnlockCost,ExpectedGold,RunsNeeded')
for (let level = 1; level <= 100; level++) {
  const cost = calculateUnlockCost(level)
  const stage = level <= 20 ? 'early' : level <= 60 ? 'mid' : 'late'
  const gold = calculateExpectedGold(dropConfigs[stage], 30, 2000)
  const runs = cost === 0 ? 0 : Math.ceil(cost / gold)
  console.log(`${level},${cost},${gold},${runs}`)
}

console.log('\n✨ Teste concluído!\n')
