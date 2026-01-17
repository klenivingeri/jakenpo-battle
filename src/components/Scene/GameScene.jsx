
import { Header } from '../HUD/ControlEnemy'
import { Footer } from '../HUD/Control'
import Jankenpo from '../Jankenpo';
import './GameScene.css'

export const GameScene = (props) => {
  return (
   <>
    <div className='container_game_scene' style={{ background: 'url(/assets/background/vila.gif)' }}>
      <Header {...props}></Header>
      <Jankenpo {...props} />
      <Footer {...props}></Footer>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: 'calc(100% - 80px)',
          background: 'white',
          opacity: 0.7,
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      >
      </div>
    </div></>
  )
}