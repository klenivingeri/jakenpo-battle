import { Header } from '../HUD/ControlEnemy'
import { Footer } from '../HUD/Control'
import Jankenpo from '../Jankenpo';
import EconomyDebug from '../debug/EconomyDebug';
import GameTutorial from '../shared/GameTutorial';
import './GameScene.css'
import { useEffect, useRef } from 'react';

export const GameScene = (props) => {
  return (
   <>
    <div className='container_game_scene' >
      <Header 
        enemy={props.enemy}
        isInfiniteMode={props.isInfiniteMode}
        currentPhase={props.currentPhase}
        totalTime={props.totalTime}
        timeLeft={props.timeLeft}
      />
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
        {props.isEconomyDebugOn && (
          <EconomyDebug 
            roomLevel={props.roomLevel || 1}
            enemyDropConfig={props.enemyDropConfig}
            gameDuration={props.gameDuration}
            spawnInterval={props.spawnInterval}
          />
        )}
      </div>
      <Footer 
        {...props}
        roomLevel={props.roomLevel}
        onSpeedChange={props.onSpeedChange}
      />
      <GameTutorial />
    </div></>
  )
}