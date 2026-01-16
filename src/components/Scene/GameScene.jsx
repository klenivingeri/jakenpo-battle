
import { Header } from '../HUD/ControlEnemy'
import { Footer } from '../HUD/Control'
import './GameScene.css'

export const GameScene = (props) => {
  return (
    <div className='container_game_scene'>
      <Header {...props}></Header>

      <Footer {...props}></Footer>
    </div>
  )
}