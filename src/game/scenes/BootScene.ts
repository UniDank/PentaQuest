import type { Cameras } from 'phaser'
import { Scene } from 'phaser'
import { useMainStore } from '../../stores/mainStore'

export default class BootScene extends Scene {
  private sceneStore = useMainStore()

  constructor() {
    super({ key: 'BootScene' })
  }

  init() {

  }

  preload() {

  }

  create() {
    const mainCamera = this.cameras.main
    mainCamera.fadeIn(300, 0, 0, 0, (camera: Cameras.Scene2D.Camera, progress: number) => {
      if (progress >= 0.7)
        this.sceneStore.changeInterface('MainMenu')
    })

    this.anims.createFromAseprite('mainBg')
    const bgSprite = this.add.sprite(0, 0, 'mainBg').setOrigin(0)
    bgSprite.play({ key: 'Animation', repeat: -1, frameRate: 15 })

    this.anims.createFromAseprite('animatedTitle')
    const titleSprite = this.add.sprite(this.scale.gameSize.width * 0.025, this.scale.gameSize.height * 0.05, 'animatedTitle').setOrigin(0).setScale(2)
    titleSprite.play({ key: 'Clean', repeat: -1, frameRate: 15, repeatDelay: 3000 })

    this.sceneStore.$onAction(({ name, args }) => {
      if (name === 'changeScene' && this.sceneStore.currentScene === this.scene.key) {
        mainCamera.fadeOut(300, 0, 0, 0)
        this.sceneStore.closeInterface()
        mainCamera.on('camerafadeoutcomplete', () => this.scene.start(args[0], args[1]))
      }
    })

    this.sound.stopByKey('stageSong')
    this.sound.play('bgSong', { loop: true })
  }

  update() {

  }
}
