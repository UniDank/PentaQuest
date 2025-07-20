import { Scene } from 'phaser'
import { useDebugStore } from '../../stores/debugStore'

export default class DebugScene extends Scene {
  private sceneStore = useDebugStore()

  constructor() {
    super({ key: 'DebugScene', active: true /* se è in modalità debug, attivarla */ })
  }

  create() {
    this.sceneStore.$onAction(({ name }) => {
      if (name === 'toggleFullscreen')
        this.scale.toggleFullscreen()
    })
  }

  update() {
    this.sceneStore.currentFps = this.game.loop.actualFps

    const pointer = this.input.activePointer
    this.sceneStore.currentMouse = { x: pointer.x, y: pointer.y }
  }
}
