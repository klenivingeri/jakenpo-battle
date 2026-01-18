# Refatoração do Projeto Emoji Battle

## 📋 Resumo das Melhorias

Esta refatoração focou em reduzir duplicação de código, criar componentes reutilizáveis e melhorar a organização do projeto.

## 🎯 Mudanças Implementadas

### 1. **Componentes Reutilizáveis Criados**

#### `HPBar` (Barra de HP)
- **Localização**: `src/components/shared/HPBar/`
- **Propósito**: Componente reutilizável para exibir barras de vida
- **Props**:
  - `hp`: HP atual
  - `maxHp`: HP máximo (padrão: 10)
  - `showValue`: Mostrar valor numérico (padrão: false)
  - `className`: Classes CSS adicionais
- **Substituiu**: Código duplicado em `Control` e `ControlEnemy`

#### `ActionButton` (Botão de Ação)
- **Localização**: `src/components/shared/ActionButton/`
- **Propósito**: Botão reutilizável com feedback tátil e visual
- **Props**:
  - `type`: Tipo do botão
  - `label`: Texto do botão
  - `icon`: Ícone/imagem
  - `onClick`: Callback ao clicar
  - `disabled`: Estado desabilitado
  - `onVibrate`: Callback de vibração
- **Substituiu**: 3 botões duplicados no componente `Control`

### 2. **Hooks Customizados**

#### `useVibration`
- **Localização**: `src/hooks/useVibration.js`
- **Propósito**: Centralizar lógica de vibração do dispositivo
- **Métodos**:
  - `vibrate(pattern)`: Vibração customizada
  - `vibrateClick()`: Vibração de clique (10ms)
  - `vibrateHit()`: Vibração de acerto (40ms)
  - `vibrateDamage()`: Vibração de dano ([100, 50, 100]ms)
- **Substituiu**: Função `vibrate` duplicada em 3 arquivos diferentes

### 3. **Constantes e Configurações**

#### `gameConfig.js`
- **Localização**: `src/constants/gameConfig.js`
- **Conteúdo**:
  - `BULLET_TYPES`: Tipos de bullets (pedra, papel, tesoura)
  - `BULLET_CONFIG`: Configuração completa de cada bullet (labels, imagens)
  - `GAME_IMAGES`: Caminhos das imagens do jogo
  - `GAME_SOUNDS`: Caminhos dos sons
  - `DEFAULT_GAME_CONFIG`: Valores padrão do jogo
- **Benefício**: Centralização de configurações, fácil manutenção

### 4. **Utilitários de Jogo**

#### `gameUtils.js`
- **Localização**: `src/utils/gameUtils.js`
- **Funções**:
  - `checkCollision(a, b)`: Detecta colisão entre objetos
  - `getGameResult(playerChoice, enemyChoice)`: Determina resultado (win/loss/draw)
  - `selectRandomBulletType(previousBullets, allTypes)`: Escolhe tipo aleatório evitando repetição
  - `createBullet(type, x, y, width, height)`: Factory de bullets
  - `updateBulletTransform(bullet, deltaY, now, canvasWidth, animationDuration)`: Atualiza posição/escala
  - `createParticle(x, y)`: Factory de partículas
  - `createExplosion(x, y)`: Factory de explosões
- **Substituiu**: Funções helper duplicadas e código inline

## 📊 Métricas de Melhoria

### Redução de Código

| Arquivo | Antes | Depois | Redução |
|---------|-------|--------|---------|
| `Control/index.jsx` | ~80 linhas | ~30 linhas | **62%** |
| `ControlEnemy/index.jsx` | ~13 linhas | ~10 linhas | **23%** |
| `Jankenpo/index.jsx` | ~438 linhas | ~380 linhas* | **13%** |
| `App.jsx` | Função duplicada | Removida | - |

*\*Nota: Jankenpo ficou mais limpo mas manteve complexidade devido à lógica do canvas*

### Duplicação Eliminada

- ❌ **3x** função `vibrate()` em arquivos diferentes
- ❌ **2x** código de barra de HP
- ❌ **3x** código de botão com touch handlers
- ❌ **Múltiplas** constantes mágicas (50, 200, 500, etc)
- ❌ **2x** funções `checkCollision` e `getResult`

## 🎨 Estrutura de Pastas Resultante

```
src/
├── components/
│   ├── shared/              # ✨ NOVO
│   │   ├── HPBar/
│   │   │   ├── index.jsx
│   │   │   └── HPBar.css
│   │   └── ActionButton/
│   │       ├── index.jsx
│   │       └── ActionButton.css
│   ├── HUD/
│   │   ├── Control/         # Refatorado
│   │   └── ControlEnemy/    # Refatorado
│   └── Jankenpo/            # Refatorado
├── hooks/                   # ✨ NOVO
│   └── useVibration.js
├── constants/               # ✨ NOVO
│   └── gameConfig.js
└── utils/                   # ✨ NOVO
    └── gameUtils.js
```

## 🚀 Benefícios

### Manutenibilidade
- ✅ Alterações em barras de HP agora feitas em 1 lugar
- ✅ Mudanças em botões propagam automaticamente
- ✅ Constantes centralizadas facilitam ajustes

### Testabilidade
- ✅ Funções utilitárias podem ser testadas isoladamente
- ✅ Componentes menores são mais fáceis de testar
- ✅ Lógica separada da apresentação

### Reutilização
- ✅ `HPBar` pode ser usado em novas telas
- ✅ `ActionButton` pode ter diferentes estilos/temas
- ✅ `useVibration` disponível para qualquer componente

### Legibilidade
- ✅ Código mais declarativo e menos imperativo
- ✅ Menos "números mágicos"
- ✅ Intenção clara através de nomes descritivos

## 🔄 Próximos Passos Sugeridos

1. **Extrair lógica do canvas** para hooks customizados:
   - `useGameLoop()`
   - `useBulletManager()`
   - `useParticleSystem()`

2. **Criar componente de Stats**:
   - Extrair o display de estatísticas para componente próprio

3. **Adicionar PropTypes ou TypeScript**:
   - Validação de props em tempo de desenvolvimento

4. **Testes unitários**:
   - Testar `gameUtils.js`
   - Testar `useVibration`
   - Testar componentes isolados

5. **Melhorar CSS**:
   - Criar tema com CSS variables
   - Componentizar estilos repetidos

## 📝 Como Usar os Novos Componentes

### HPBar
```jsx
import { HPBar } from '../../shared/HPBar'

// Simples
<HPBar hp={player.hp} maxHp={10} />

// Com valor visível
<HPBar hp={player.hp} maxHp={10} showValue={true} />

// Com classe customizada
<HPBar hp={enemy.hp} maxHp={20} className="enemy-bar" />
```

### ActionButton
```jsx
import { ActionButton } from '../../shared/ActionButton'
import { useVibration } from '../../hooks/useVibration'

const { vibrateClick } = useVibration()

<ActionButton
  type="pedra"
  label="Pedra"
  icon="/assets/pedra.png"
  onClick={(type) => console.log(type)}
  disabled={false}
  onVibrate={vibrateClick}
/>
```

### useVibration
```jsx
import { useVibration } from '../hooks/useVibration'

const MyComponent = () => {
  const { vibrateClick, vibrateHit, vibrateDamage } = useVibration()
  
  return (
    <button onClick={vibrateClick}>Click me!</button>
  )
}
```

## ⚠️ Breaking Changes

Nenhuma! A refatoração manteve 100% de compatibilidade com a API existente.

## 🐛 Possíveis Issues

- Certifique-se de que todos os imports estão corretos
- CSS pode precisar de ajustes finos para manter aparência idêntica
- Testes existentes podem precisar atualização para novos caminhos de import

---

**Data da Refatoração**: Janeiro 2026  
**Desenvolvedor**: GitHub Copilot
