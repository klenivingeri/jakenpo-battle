# Melhoria na game play
Analisar /data/bullet_attributes.json
## Adicionar possibilidade de vir bullets mais fortes.

### Como isso vai funcionar

- usar o obj 
```
{ // obj rooms
  id: level,
  gameDuration: 30 + resetIndex,
  speed: baseSpeed,
  spawnInterval: baseSpawnInterval,
  bulletsPerAction: 1,
  enemyAtk: 1,
  enemyHp: 10,
  disableButton: i > roomCurrent,
};
```
- Adicione enemy

```
enemy{
  "common": {
    "drop": 100
  },
  "uncommon": {
    "drop": 0
  },
  "rare": {
    "drop": 0
  },
  "heroic": {
    "drop": 0
  },
  "legendary": {
    "drop": 0
  },
  "mythic": {
    "drop": 0
  },
  "immortal": {
    "drop": 0
  }
}
```
- remover   enemyAtk: 1,  enemyHp: 10, e passar a usar os valores de /data/bullet_attributes.json

conforme vai subindo o nivel dos mapas vai subindo a chance de aparecer bullets mais raros.


## Idenfificação dos bullets dentro do canvas

### Exibição de vida
   - A barra de vida do bullet deve ficar dentre o bullet e o rastro que ele deixa.
   - tamanho da barra, height:8 x width-max:32
   - cada vida deve ser separa em blocos, ex [][][][].
   - de cordo que o inimigo bullet sobrer dano são removida as barras.
   -  Pode tmb mudar a vida do player e do inimigo pra esse estilo de barras, pra ficar uma unica barra devida reutilizada em todos o lugares.

### Identificarção de bullets
  -Alem da barra de vida
  - bullet deve mudar a cor do rastro de acordo com as cores no /data/bullet_attributes.json

### Regras de combate
  - Se o  bullet chegar a 0 o bullet é destruido.
  - se o bullet tiver 2hp e 1 de atack e o outro 1hp e 1atack , o bullet 2 1 deve receber 1 de dano, e o bullet 1 1  recebe 1 de dano o hp é zerado e ele é destruido 



  Cada fase utiliza o seguinte objeto base:

{
  id: level,
  gameDuration: 30 + resetIndex,
  speed: baseSpeed,
  spawnInterval: baseSpawnInterval,
  bulletsPerAction: 1,
  disableButton: i > roomCurrent,

  enemy: {
    common: { drop: 100 },
    uncommon: { drop: 0 },
    rare: { drop: 0 },
    heroic: { drop: 0 },
    legendary: { drop: 0 },
    mythic: { drop: 0 },
    immortal: { drop: 0 }
  }
}
Regras

drop representa chance percentual

A soma total dos drops deve ser 100

A cada bullet inimigo criado:

é feito 1 sorteio

define sua raridade

Conforme os níveis avançam:

chances de raridades maiores aumentam

bullets comuns diminuem

🔄 Remoção de atributos duplicados

Remover do objeto da fase:

enemyHp

enemyAtk

Esses valores passam a vir exclusivamente do arquivo bullet_attributes.json.

🖌️ Identificação visual dos bullets no canvas
Barra de Vida

Posição: entre o bullet e o rastro

Tamanho máximo: width 32x8 height

Estilo: blocos segmentados

Exemplo:

Regra correta de Vida (HP contínuo)

hp NÃO é inteiro obrigatório

HP pode ser:

4

2.5

0.5

O bullet só morre quando hp <= 0

Os blocos de vida são apenas visuais

👉 Você não remove bloco diretamente,
o bloco some porque o hp caiu.

🖌️ Blocos de Vida (representação visual)
Regra visual

Cada bloco representa 1 HP cheio

O número de blocos exibidos é:

Math.ceil(hp)

Exemplo
HP real	Blocos exibidos
3.0	[][][]
2.5	[][][]
2.0	[][]
1.5	[][]
1.0	[]
0.5	[]
0.0	destruído

💡 Isso mantém o feedback claro sem perder precisão.

⚔️ Regra de Combate (ATUALIZADA)
Vitória normal

Dano aplicado = atk (inteiro)

Draw (mesmo símbolo)

Dano aplicado = atk / 2

Ex:

atk = 1 → dano = 0.5

atk = 2 → dano = 1

Aplicação
enemy.hp -= damage
player.hp -= damage

🎮 Exemplo exato do que você descreveu

Bullet A:

HP = 2

ATK = 1

Bullet B:

HP = 2

ATK = 1

Draw

Ambos recebem:

1 / 2 = 0.5

Resultado:

HP = 1.5

Blocos visuais = 2

✔️ Bloco não é removido manualmente
✔️ Ele desaparece quando o HP real cruza o limite
Além da barra de vida:

o rastro do bullet deve usar a color definida no bullet_attributes.json

Isso permite identificar raridade sem texto

⚔️ Regras de Combate entre Bullets

Cada bullet possui:

hp

atk (dano causado)

Colisão entre dois bullets

Ambos aplicam dano simultaneamente:

bulletA.hp -= bulletB.atk
bulletB.hp -= bulletA.atk
Resultado

Se hp <= 0 → bullet é destruído

Se ambos chegarem a 0 → ambos são destruídos

Exemplo

Bullet A: HP 2 / ATK 1

Bullet B: HP 1 / ATK 1

Resultado:

Bullet A → HP 1

Bullet B → HP 0 (destruído)

🎯 Objetivo do sistema

Introduzir progressão de dificuldade

Evitar spam de bullets

Tornar a leitura visual clara

Manter o combate justo baseado em pressão (HP total), não quantidade