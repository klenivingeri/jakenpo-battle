/**
 * 🎮 CONFIGURAÇÃO RÁPIDA DE BALANCEAMENTO
 * 
 * Use este arquivo para ajustar rapidamente o sistema econômico
 * sem precisar mexer no código principal.
 */

import { updateEconomyConfig } from './src/utils/economyUtils'

// ========================================
// 🎯 PRESETS PRONTOS PARA USO
// ========================================

export const ECONOMY_PRESETS = {
  // Balanceamento padrão - Recomendado
  DEFAULT: {
    BASE_MULTIPLIER: 15,
    EXPONENT: 1.35,
    LINEAR_BONUS: 5,
    MIN_RUNS_MULTIPLIER: 3.0
  },

  // Progressão mais rápida - Para testes ou casual
  EASY: {
    BASE_MULTIPLIER: 10,
    EXPONENT: 1.25,
    LINEAR_BONUS: 8,
    MIN_RUNS_MULTIPLIER: 2.5
  },

  // Progressão normal - Boa para maioria dos jogadores
  NORMAL: {
    BASE_MULTIPLIER: 15,
    EXPONENT: 1.35,
    LINEAR_BONUS: 5,
    MIN_RUNS_MULTIPLIER: 3.0
  },

  // Progressão desafiadora - Para players hardcore
  HARD: {
    BASE_MULTIPLIER: 20,
    EXPONENT: 1.45,
    LINEAR_BONUS: 3,
    MIN_RUNS_MULTIPLIER: 4.0
  },

  // Progressão extrema - Para endgame/veteran content
  EXTREME: {
    BASE_MULTIPLIER: 25,
    EXPONENT: 1.5,
    LINEAR_BONUS: 2,
    MIN_RUNS_MULTIPLIER: 5.0
  },

  // Progressão linear - Crescimento constante
  LINEAR: {
    BASE_MULTIPLIER: 5,
    EXPONENT: 1.0,
    LINEAR_BONUS: 15,
    MIN_RUNS_MULTIPLIER: 3.0
  },

  // Para eventos especiais - Gold dobrado
  EVENT_DOUBLE_GOLD: {
    BASE_MULTIPLIER: 7.5,  // Metade do custo (gold dobra)
    EXPONENT: 1.35,
    LINEAR_BONUS: 2.5,
    MIN_RUNS_MULTIPLIER: 1.5
  }
}

// ========================================
// 🔧 AJUSTES FINOS POR FASE
// ========================================

/**
 * Modificadores por segmento de fases
 * Aplique desconto/aumento baseado no nível
 */
export const PHASE_MODIFIERS = {
  // Fases 1-10: 20% mais barato (tutorial)
  early: {
    range: [1, 10],
    modifier: 0.8
  },

  // Fases 11-30: Custo normal
  beginner: {
    range: [11, 30],
    modifier: 1.0
  },

  // Fases 31-60: Custo normal
  intermediate: {
    range: [31, 60],
    modifier: 1.0
  },

  // Fases 61-85: 10% mais caro (desafio)
  advanced: {
    range: [61, 85],
    modifier: 1.1
  },

  // Fases 86-100: 15% mais caro (endgame)
  endgame: {
    range: [86, 100],
    modifier: 1.15
  }
}

// ========================================
// 🎁 SISTEMA DE DESCONTOS/BOOSTS
// ========================================

/**
 * Calcula desconto baseado em tentativas
 * Quanto mais você tenta, mais barato fica
 */
export const calculateRetryDiscount = (attempts, maxDiscount = 0.3) => {
  return Math.min(attempts * 0.02, maxDiscount)
}

/**
 * Boost temporário de gold (eventos)
 */
export const GOLD_BOOST_PRESETS = {
  WEEKEND: 1.5,      // +50% gold aos finais de semana
  EVENT: 2.0,        // x2 gold em eventos
  PREMIUM: 2.5,      // x2.5 gold para premium
  MEGA_EVENT: 3.0    // x3 gold (eventos especiais)
}

/**
 * Desconto por conquistas
 */
export const ACHIEVEMENT_DISCOUNTS = {
  FIRST_WIN: 0.05,           // -5% em todos os custos
  SPEEDRUNNER: 0.10,         // -10% (completou fase em <20s)
  NO_DAMAGE: 0.08,           // -8% (completou sem levar dano)
  COMPLETIONIST: 0.15,       // -15% (todas as fases com 3 estrelas)
  VETERAN: 0.20              // -20% (jogou 500+ rodadas)
}

// ========================================
// 📊 FUNÇÕES DE AJUSTE DINÂMICO
// ========================================

/**
 * Aplica preset de balanceamento
 * 
 * @param {string} presetName - Nome do preset
 */
export const applyPreset = (presetName) => {
  const preset = ECONOMY_PRESETS[presetName]
  if (!preset) {
    console.error(`Preset "${presetName}" não encontrado`)
    return
  }
  
  updateEconomyConfig(preset)
  console.log(`✅ Preset "${presetName}" aplicado com sucesso!`)
}

/**
 * Ajusta dificuldade baseado em feedback de players
 * 
 * @param {number} averageRunsPerRoom - Média de rodadas que players estão fazendo
 * @param {number} targetRuns - Alvo desejado
 */
export const autoBalance = (averageRunsPerRoom, targetRuns = 3.5) => {
  const ratio = averageRunsPerRoom / targetRuns
  
  if (ratio > 1.5) {
    // Players estão fazendo muitas rodadas - tornar mais fácil
    console.log('⚠️ Jogo muito difícil, aplicando ajuste...')
    applyPreset('EASY')
  } else if (ratio < 0.7) {
    // Players progridem rápido demais - tornar mais difícil
    console.log('⚠️ Jogo muito fácil, aplicando ajuste...')
    applyPreset('HARD')
  } else {
    console.log('✅ Balanceamento adequado!')
  }
}

/**
 * Calcula custo com todos os modificadores aplicados
 * 
 * @param {number} baseUnlockCost - Custo base
 * @param {number} level - Nível da fase
 * @param {number} attempts - Tentativas do jogador
 * @param {array} achievements - Conquistas desbloqueadas
 * @param {number} goldBoost - Multiplicador de gold ativo
 * @returns {number} Custo final
 */
export const calculateFinalCost = (
  baseUnlockCost,
  level,
  attempts = 0,
  achievements = [],
  goldBoost = 1.0
) => {
  let finalCost = baseUnlockCost

  // Aplica modificador de fase
  for (const phase of Object.values(PHASE_MODIFIERS)) {
    if (level >= phase.range[0] && level <= phase.range[1]) {
      finalCost *= phase.modifier
      break
    }
  }

  // Aplica desconto por tentativas
  const retryDiscount = calculateRetryDiscount(attempts)
  finalCost *= (1 - retryDiscount)

  // Aplica descontos de conquistas
  let achievementDiscount = 0
  achievements.forEach(achievement => {
    achievementDiscount += ACHIEVEMENT_DISCOUNTS[achievement] || 0
  })
  finalCost *= (1 - Math.min(achievementDiscount, 0.5)) // Max 50% de desconto

  // Ajusta baseado no boost de gold
  // Se gold está dobrado, custos podem ser reduzidos
  if (goldBoost > 1.0) {
    finalCost *= (1 / goldBoost)
  }

  return Math.floor(finalCost)
}

// ========================================
// 🎮 MODO SANDBOX (Para testes)
// ========================================

export const SANDBOX_MODE = {
  // Desbloqueio instantâneo (para testar conteúdo)
  INSTANT_UNLOCK: {
    BASE_MULTIPLIER: 0.1,
    EXPONENT: 1.0,
    LINEAR_BONUS: 0,
    MIN_RUNS_MULTIPLIER: 0.1
  },

  // Gold infinito (para testar mecânicas)
  INFINITE_GOLD: {
    goldMultiplier: 999999
  }
}

// ========================================
// 📈 ANALYTICS E MONITORAMENTO
// ========================================

/**
 * Registra métricas para análise
 */
export const trackEconomyMetrics = (event, data) => {
  const metrics = {
    timestamp: Date.now(),
    event,
    ...data
  }

  // Log local
  console.log('📊 Economy Metric:', metrics)

  // Enviar para analytics (implementar integração)
  if (window.gtag) {
    gtag('event', event, data)
  }

  // Salvar localmente para análise offline
  const history = JSON.parse(localStorage.getItem('economyHistory') || '[]')
  history.push(metrics)
  localStorage.setItem('economyHistory', JSON.stringify(history.slice(-100)))
}

// ========================================
// 🎯 EXEMPLOS DE USO
// ========================================

/*

// 1. Aplicar preset
applyPreset('NORMAL')

// 2. Ajuste customizado
updateEconomyConfig({
  BASE_MULTIPLIER: 18,
  EXPONENT: 1.4,
  LINEAR_BONUS: 6
})

// 3. Calcular custo com modificadores
const finalCost = calculateFinalCost(
  500,                      // Custo base
  45,                       // Nível 45
  5,                        // 5 tentativas
  ['SPEEDRUNNER', 'NO_DAMAGE'], // Conquistas
  2.0                       // Boost x2 de gold
)
console.log(`Custo final: ${finalCost} gold`)

// 4. Modo evento (fim de semana)
applyPreset('EVENT_DOUBLE_GOLD')
trackEconomyMetrics('event_started', { 
  type: 'weekend', 
  boost: GOLD_BOOST_PRESETS.WEEKEND 
})

// 5. Análise automática de balanceamento
autoBalance(4.5, 3.0) // Players fazendo 4.5 rodadas em média, alvo é 3.0

*/

export default ECONOMY_PRESETS
