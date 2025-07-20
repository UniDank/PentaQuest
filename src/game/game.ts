import { GridEngine } from 'grid-engine'
import Phaser, { Animations } from 'phaser'
import BootScene from './scenes/BootScene'
import CombatScene from './scenes/CombatScene'
import DebugScene from './scenes/DebugScene'
import HandlerScene from './scenes/HandlerScene'
import SelectScene from './scenes/SelectScene'
import StageScene from './scenes/StageScene'
import GetFastValue = Phaser.Utils.Objects.GetFastValue
import GetValue = Phaser.Utils.Objects.GetValue

declare module 'phaser' {
  interface Scene {
    gridEngine: GridEngine
  }
  namespace Animations {
    interface AnimationState {
      createFromAseprite(game: Phaser.Game, key: string, tags?: string[] | undefined): Animation[]
    }
  }
}

Animations.AnimationState.prototype.createFromAseprite = function (game: Phaser.Game, key: string, tags?: string[] | undefined): Animations.Animation[] {
  const output: Animations.Animation[] = []
  const data = game.cache.json.get(key)

  if (!data)
    return output

  const meta = GetValue(data, 'meta', null)
  const frames = GetValue(data, 'frames', null)

  if (meta && frames) {
    const frameTags = GetValue(meta, 'frameTags', [])

    frameTags.forEach((tag: any) => {
      let animFrames: { key: string, frame: string, duration: number }[] = []

      const name = GetFastValue(tag, 'name', null)
      const from = GetFastValue(tag, 'from', 0)
      const to = GetFastValue(tag, 'to', 0)
      const direction = GetFastValue(tag, 'direction', 'forward')

      if (!name)
        return

      if (!tags || (tags && tags.includes(name))) {
        const tempFrames: { frame: string, duration: number }[] = []
        let minDuration = Number.MAX_SAFE_INTEGER

        for (let i = from; i <= to; i++) {
          const frameKey = i.toString()
          const frame = frames[frameKey]

          if (frame) {
            const frameDuration = GetFastValue(frame, 'duration', Number.MAX_SAFE_INTEGER)

            if (frameDuration < minDuration)
              minDuration = frameDuration

            tempFrames.push({ frame: frameKey, duration: frameDuration })
          }
        }

        tempFrames.forEach((entry) => {
          animFrames.push({
            key,
            frame: entry.frame,
            duration: (minDuration - entry.duration),
          })
        })

        const totalDuration = (minDuration * animFrames.length)

        if (direction === 'reverse')
          animFrames = animFrames.reverse()

        const createConfig = {
          key: name,
          frames: animFrames,
          duration: totalDuration,
          yoyo: (direction === 'pingpong'),
        }

        const result = this.create(createConfig)

        if (result)
          output.push(result)
      }
    })
  }

  return output
}

function launch(containerId: string) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    backgroundColor: '#353535',
    pixelArt: true,
    scale: {
      fullscreenTarget: 'body',
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: containerId,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    plugins: {
      scene: [
        {
          key: 'gridEngine',
          plugin: GridEngine,
          mapping: 'gridEngine',
        },
      ],
    },
    zoom: 1,
    dom: {
      createContainer: true,
    },
    audio: {
      disableWebAudio: true,
    },
    scene: [HandlerScene, DebugScene, BootScene, SelectScene, StageScene, CombatScene],
  })
}

export default launch
export { launch }
