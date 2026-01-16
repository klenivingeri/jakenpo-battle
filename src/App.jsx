import { useState } from 'react'
import './App.css'
import { GameScene } from './components/Scene/GameScene'
import { InitScene } from './components/Scene/InitScene'



function App() {
  const [player, setPlayer] = useState({ hp: 100, atk: 10 })
  const [enemy, setEnemy] = useState({ hp: 100, atk: 10  })
  const [bullet, setBullet] = useState({player: {}, enemy: {}})
  const [disableButtonPlayer, setdisableButtonPlayer] = useState(false)
  const [scene, setScene] = useState('Init')
  const [gameDuraction, setGameDuractions] = useState(60)
  const [roomCurrent, setRoomCurrent] = useState(0)
  

  const rooms = Array.from({ length: 100 }, (_, i) => (  {
    id: i+1,
    gameDuraction: 30+i,
    speed: i,
    disableButton: roomCurrent < i ? true : false
  })
);

  const handleBullet = (type, shooter) => {
    const type_bullet = {
      pedra: 'pedra',
      papel:'papel',
      tesoura:'tesoura'
    }
    setBullet({...bullet, [shooter]: type_bullet[type]})
  }

  const stateScene = {
    Init: (
    <InitScene setScene={setScene} rooms={rooms} setRoomCurrent={setRoomCurrent}></InitScene>
  ),
    Game: (
    <GameScene handleBullet={handleBullet} player={player} enemy={enemy} disableButtonPlayer={disableButtonPlayer}>
      {/**
       * 
       * JAKENPO
       * Crie um canvas e adicione aqui
       * Obs: vamos chamar o papel/pedra/tesoura de bullet
       * O inimigo dispara bullet aleatorio, mas não pode se repetir mais de 2 vezes.
       * use as imagens /assets/1_pedra.png /assets/2_papel.png /assets/3_tesoura.png 
       * O inimigo deve disparar do centro da tela na horizontalment, e no top da vertical
       * O player disparar do centro da tela horizontalment, e no bottom da vertical
       * A cada x tempo o inimigo manda um bullet, e o player precisa responder.
       * o play só pode mandar bullet enquanto a quantide dele for menor doque a do inimigo
       * 
       * exemplo: vamos supor que o speed do inimgo está rapido, ele já disparou 3 vezes e os bullets ainda se encotram na tela. então o player pode lançar 3
       * se a quantiade for igual em tela disableButtonPlayer deve ser true.
       * se os bullet se colidirem use a imagem /assets/explosao.gif
       * se o bullet inimgo atingir o final da tela, tmb use /assets/explosao.gif e remova o valor de ataque do inimigo da vida do play   const [player, setPlayer] = useState({ hp: 100, atk: 10 })
       * 
       * // Dentro do useEffect do seu componente Game
        const update = () => {
          // 1. Mover bullets (Player y -= speed, Inimigo y += speed)
          // 2. Checar Colisão entre bullets (Use a regra Pedra/Papel/Tesoura)
          // 3. Checar Colisão com as bordas (Dano no HP)
          // 4. Filtrar bullets mortos:
          // setBullets(prev => prev.filter(b => b.active));
          
          requestAnimationFrame(update);
        };

        quand o tempo acabar leve o player pra setScene('EndResult')
        Aqui deve ser exibidos, quantos bullets ele destrui, quanto dele foi destruido, e quando ficaram empatados
       */}
    </GameScene>
  ),
    EndResult: (
    <div>
      <button onClick={() => {
        setScene('Init')
        setRoomCurrent(roomCurrent+1)
      }}>Voltar para o menu</button>
    </div>
  )
  }

  return stateScene[scene]
}

export default App
