# 📚 Documentação do Sistema de Economia

## 🎮 Visão Geral

Sistema completo de progressão baseado em **gold** para o jogo Emoji Battle. O sistema foi projetado para balancear engajamento, satisfação e longevidade do jogo.

---

## 📖 Documentos Disponíveis

### 📊 [RESUMO.md](RESUMO.md)
**Leia primeiro!** Resumo executivo com tudo que foi implementado.

**Conteúdo:**
- O que foi criado
- Status de implementação
- Como testar
- Checklist de integração

---

### 💰 [ECONOMIA.md](ECONOMIA.md)
Documentação técnica completa do sistema econômico.

**Conteúdo:**
- Fórmula de cálculo de custo
- Parâmetros ajustáveis
- Tabela de custos e progressão
- API de funções utilitárias
- Exemplos de código
- Ajustes de balanceamento
- Expansões futuras
- UI recomendada
- Troubleshooting

---

### 🔧 [INTEGRACAO.md](INTEGRACAO.md)
Guia passo-a-passo de como integrar o sistema no jogo.

**Conteúdo:**
- Checklist de implementação
- Estado do jogador (gold)
- Ganho de gold ao derrotar inimigos
- Sistema de desbloqueio
- UI de seleção de fases
- HUD de gold no jogo
- Notificações visuais
- Exemplo de fluxo completo
- Testes manuais
- Console debug
- Problemas comuns

---

### 📈 [TABELA_PROGRESSAO.md](TABELA_PROGRESSAO.md)
Dados completos de todas as 100 fases.

**Conteúdo:**
- Tabelas de progressão (1-100)
- Custo por fase
- Gold esperado por rodada
- Rodadas necessárias
- Tempo acumulado
- Análise estatística
- Marcos de progressão
- Sistema de títulos
- Estratégias de farm
- Gráficos de curva

---

## 🚀 Início Rápido

### 1. Entender o Sistema (5 min)

Leia: [RESUMO.md](RESUMO.md)

### 2. Revisar Valores (10 min)

Leia: [TABELA_PROGRESSAO.md](TABELA_PROGRESSAO.md)

Verifique se os valores parecem razoáveis para seu jogo.

### 3. Testar o Balanceamento (5 min)

```bash
node test-economy.js
```

Analise os resultados e ajuste se necessário.

### 4. Integrar no Jogo (30-60 min)

Siga: [INTEGRACAO.md](INTEGRACAO.md)

Implemente passo-a-passo cada parte do sistema.

### 5. Ajustar Conforme Necessário

Use: `src/config/economyPresets.js`

Aplique presets ou ajuste parâmetros.

---

## 📁 Arquivos do Sistema

```
emoji-battle/
│
├── docs/                          # 📚 Documentação
│   ├── README.md                  # Este arquivo
│   ├── RESUMO.md                  # Resumo executivo
│   ├── ECONOMIA.md                # Documentação técnica
│   ├── INTEGRACAO.md              # Guia de integração
│   └── TABELA_PROGRESSAO.md       # Dados de progressão
│
├── src/
│   ├── utils/
│   │   ├── economyUtils.js        # 🔧 Funções de cálculo
│   │   └── index.js               # Exports
│   │
│   ├── config/
│   │   └── economyPresets.js      # 🎛️ Presets e ajustes
│   │
│   ├── components/
│   │   ├── shared/
│   │   │   └── UnlockCost/        # 🎨 UI de desbloqueio
│   │   │       ├── index.jsx
│   │   │       └── UnlockCost.css
│   │   │
│   │   └── debug/
│   │       └── ProgressionDebug/  # 🐛 Componente debug
│   │           ├── index.jsx
│   │           └── ProgressionDebug.css
│   │
│   └── App.jsx                    # ✅ Integração em rooms
│
└── test-economy.js                # 🧪 Script de teste
```

---

## 🎯 Fluxo de Trabalho Recomendado

### Para Game Designers

1. Execute `node test-economy.js`
2. Analise a tabela de progressão
3. Ajuste presets em `economyPresets.js`
4. Re-execute o teste
5. Repita até satisfeito

### Para Programadores

1. Leia [INTEGRACAO.md](INTEGRACAO.md)
2. Implemente estado de gold
3. Implemente ganho de gold
4. Implemente validação de desbloqueio
5. Integre componentes UI
6. Teste a progressão

### Para QA/Testers

1. Leia [TABELA_PROGRESSAO.md](TABELA_PROGRESSAO.md)
2. Jogue fases 1-20 normalmente
3. Compare rodadas necessárias vs esperado
4. Reporte discrepâncias
5. Teste edge cases (0 gold, gold negativo, etc.)

---

## 🔧 Ajuste Rápido de Balanceamento

### Cenário: Jogo muito fácil

```javascript
import { applyPreset } from './src/config/economyPresets'
applyPreset('HARD')
```

### Cenário: Jogo muito difícil

```javascript
applyPreset('EASY')
```

### Cenário: Evento especial (dobrar gold)

```javascript
applyPreset('EVENT_DOUBLE_GOLD')
```

### Cenário: Ajuste fino personalizado

```javascript
import { updateEconomyConfig } from './src/utils/economyUtils'

updateEconomyConfig({
  BASE_MULTIPLIER: 18,   // Ajuste aqui
  EXPONENT: 1.4,         // E aqui
  LINEAR_BONUS: 6        // E aqui
})
```

---

## 📊 Métricas Importantes

### Para Monitorar

- **Rodadas médias por fase**: Alvo ~3-5 (inicial) a ~15-20 (final)
- **Taxa de abandono**: Se alta em certas fases, ajuste custo
- **Tempo médio por nível**: Deve crescer gradualmente
- **Taxa de conversão**: % de jogadores que chegam na fase 50, 75, 100

### KPIs Recomendados

```javascript
{
  averageRunsPerRoom: 5.2,        // Alvo: 3-8
  completionRate: {
    level10: 0.95,                // 95% chegam na fase 10
    level25: 0.80,                // 80% chegam na fase 25
    level50: 0.50,                // 50% chegam na fase 50
    level100: 0.15                // 15% completam o jogo
  },
  averagePlaytime: '18h',         // Tempo médio até fase 100
  retentionDay7: 0.45             // 45% voltam após 7 dias
}
```

---

## 🐛 Debug e Troubleshooting

### Problema: Custos parecem errados

```javascript
// Console do navegador
import { calculateUnlockCost } from './src/utils/economyUtils'

for (let i = 1; i <= 10; i++) {
  console.log(`Fase ${i}: ${calculateUnlockCost(i)} gold`)
}
```

### Problema: Progressão muito lenta/rápida

Execute:
```bash
node test-economy.js
```

Analise a seção "VALIDAÇÃO DE REQUISITOS"

### Problema: Gold não está sendo salvo

Verifique se o `localStorage` está funcionando:

```javascript
// Deve persistir entre reloads
localStorage.setItem('gameStats', JSON.stringify({ gold: 1000 }))
```

### Usar Componente de Debug

```jsx
import { ProgressionDebug } from './components/debug/ProgressionDebug'

// Adicionar no render (somente DEV)
{import.meta.env.DEV && (
  <ProgressionDebug
    rooms={rooms}
    currentRoom={roomCurrent}
    playerGold={gameStats.gold}
  />
)}
```

---

## 🎓 Conceitos Importantes

### 1. Unlock Cost (Custo de Desbloqueio)
Gold necessário para desbloquear uma fase.

### 2. Expected Gold (Gold Esperado)
Estimativa de gold que o jogador ganha em uma rodada.

### 3. Runs Needed (Rodadas Necessárias)
Quantas vezes o jogador precisa jogar para desbloquear.

### 4. Progression Curve (Curva de Progressão)
Como a dificuldade/custo aumenta ao longo das fases.

### 5. Economy Config (Configuração Econômica)
Parâmetros que controlam a curva de progressão.

---

## 🎨 Exemplos Visuais

### Barra de Progresso

```
🔒 Fase 25 - 243 gold
████████░░░░░░░░░░ 40%
Você tem: 97 💰
Faltam: 146 💰
```

### Notificação de Gold

```
        +3 💰
Enemy derrotado!
Rare: Wizard
```

### HUD de Gold

```
┌─────────────┐
│ 💰 1,247    │
│ +15 ✨      │
└─────────────┘
```

---

## 🚀 Expansões Futuras

### Implementações Recomendadas

1. **Sistema de Boost Temporário**
   - Dobrar gold por 1 hora
   - Adquirido com ads ou IAP

2. **Desconto por Tentativas**
   - Quanto mais tenta, mais barato fica
   - Evita frustração

3. **Missões Diárias**
   - Recompensas de gold extras
   - Aumenta engajamento

4. **Sistema de Conquistas**
   - Descontos permanentes
   - Motivação adicional

5. **Eventos Especiais**
   - Fins de semana com +50% gold
   - Fases especiais com gold bônus

---

## 📞 Suporte

### Precisa de Ajuda?

1. Releia a documentação relevante
2. Execute `node test-economy.js` para diagnóstico
3. Use o componente `<ProgressionDebug />` para visualizar
4. Verifique os exemplos em `economyPresets.js`

### Recursos Adicionais

- [Fórmula de cálculo](ECONOMIA.md#-fórmula-de-unlock-cost)
- [Guia de integração](INTEGRACAO.md)
- [Tabela completa](TABELA_PROGRESSAO.md)

---

## ✅ Checklist de Implementação

- [x] ✅ Sistema de cálculo implementado
- [x] ✅ Documentação completa
- [x] ✅ Componentes UI criados
- [x] ✅ Script de teste disponível
- [x] ✅ Presets de balanceamento prontos
- [ ] ⏳ Integrar estado de gold no App
- [ ] ⏳ Implementar ganho de gold
- [ ] ⏳ Adicionar validação de desbloqueio
- [ ] ⏳ Integrar UnlockCost na UI
- [ ] ⏳ Testar progressão completa
- [ ] ⏳ Ajustar balanceamento conforme feedback

---

## 🎉 Conclusão

O sistema está **pronto para ser integrado** no jogo. Todos os cálculos, componentes e documentação estão completos. 

**Próximos passos:**
1. Seguir [INTEGRACAO.md](INTEGRACAO.md)
2. Testar com jogadores reais
3. Ajustar conforme feedback
4. Iterar até perfeição

**Boa sorte com o desenvolvimento!** 🚀

---

**Criado em:** 18 de janeiro de 2026  
**Status:** ✅ Pronto para produção  
**Versão:** 1.0.0
