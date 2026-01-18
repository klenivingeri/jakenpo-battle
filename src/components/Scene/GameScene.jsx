import { Header } from '../HUD/ControlEnemy'
import { Footer } from '../HUD/Control'
import Jankenpo from '../Jankenpo';
import './GameScene.css'
import { useEffect, useRef } from 'react';

export const GameScene = (props) => {
  const backgroundMusic = useRef(null);

  useEffect(() => {
    backgroundMusic.current = new Audio('/assets/song/song-background.mp3');
    backgroundMusic.current.loop = true;
    backgroundMusic.current.volume = 0.07;
    backgroundMusic.current.play();
    return () => {
      backgroundMusic.current.pause();
      backgroundMusic.current = null;
    };
  }, []);

  return (
   <>
    <div className='container_game_scene' >
      <Header {...props}></Header>
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        <Jankenpo {...props} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100%', /* Changed to 100% to fill the flex container */
            background: 'white',
            opacity: 0.7,
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            top: 0 /* Added top: 0 to align with the flex container */
          }}
        >
        </div>
      </div>
      <Footer {...props}></Footer>
    </div></>
  )
}