import type { GridEngineConfig } from 'grid-engine'
import type { Cameras } from 'phaser'
import type { Entity } from '../../classes/Entity'
import { Scene } from 'phaser'
import { Enemy } from '../../classes/Enemy'
import { GameEntity } from '../../classes/GameEntity'
import { Player } from '../../classes/Player'
import { useCombatStore } from '../../stores/combatStore'
import { useMainStore } from '../../stores/mainStore'
import { useStageStore } from '../../stores/stageStore'
import Vector2 = Phaser.Math.Vector2

export default class CombatScene extends Scene {
  private sceneStore = useMainStore()
  private combatStore = useCombatStore()
  private stageStore = useStageStore()
  private players: Map<GameEntity, Player> = new Map()
  private enemies: Map<GameEntity, Enemy> = new Map()
  private map!: Phaser.Tilemaps.Tilemap
  private walkLayer!: Phaser.Tilemaps.TilemapLayer
  private radiusColor: number = 0xFFCC4A
  private rangeColor: number = 0xFF9900
  private cleanColor: number = 0xFFFFFF
  private selectionColor: number = 0x23CCAA
  private newPos = new Vector2(0, 0)
  private unsubscribeCombatActions!: Function

  constructor() {
    super({ key: 'CombatScene' })
  }

  init() {

  }

  preload() {

  }

  manhattanDist(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  }

  randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  getCurrentEntity() {
    const currentEntity = Array.from([...this.players.keys(), ...this.enemies.keys()])
      .find(v => v.entityName === this.combatStore.currentEntity?.name)
    return currentEntity!
  }

  create() {
    const mainCamera = this.cameras.main
    mainCamera.fadeIn(300, 0, 0, 0, (camera: Cameras.Scene2D.Camera, progress: number) => {
      if (progress >= 0.7)
        this.sceneStore.changeInterface('CombatInterface')
    })

    this.add.image(25, 275, 'combatBg').setScale(0.8)

    this.map = this.make.tilemap({ key: 'tiles_Map' })
    const tileSetBuilding = this.map.addTilesetImage('building', 'tiles_Building')
    const tileSetOutside = this.map.addTilesetImage('outside', 'tiles_Outside')
    this.walkLayer = this.map.createLayer('Bottom', [tileSetBuilding, tileSetOutside], 0, 0)
    this.map.createLayer('Walk', [tileSetBuilding, tileSetOutside], 0, -32)
    this.map.createLayer('Roofs', [tileSetBuilding, tileSetOutside], 0, -64)
    this.map.createLayer('Top', [tileSetBuilding, tileSetOutside], 0, -96)
    this.map.createLayer('More Top', [tileSetBuilding, tileSetOutside], 0, -128)

    this.cameras.main.setZoom(1.25).centerOn(0, 0).setOrigin(0)
    this.cameras.main.setBounds(-this.scale.gameSize.width + this.map.widthInPixels + 25, 60, this.map.widthInPixels, this.map.heightInPixels)

    this.sceneStore.$onAction(({ name, args }) => {
      if (name === 'changeScene' && this.sceneStore.currentScene === this.scene.key) {
        mainCamera.fadeOut(300, 0, 0, 0)
        this.sceneStore.closeInterface()
        mainCamera.on('camerafadeoutcomplete', () => {
          this.gridEngine.removeAllCharacters()
          this.unsubscribeCombatActions()
          this.combatStore.$reset()
          this.scene.start(args[0])
        })
      }
    })

    this.players.clear()
    this.enemies.clear()

    this.sceneStore.party.filter(p => p.health > 0).forEach((p) => {
      let randomX = this.randomNumber(3, 10)
      let randomY = this.randomNumber(3, 10)
      if (this.players.size > 0) {
        while ([...this.enemies.keys(), ...this.players.keys()]
          .findIndex(v => v.getInitPosition().x === randomX && v.getInitPosition().y === randomY) !== -1) {
          randomX = this.randomNumber(3, 10)
          randomY = this.randomNumber(3, 10)
        }
      }
      const player = new GameEntity(this, p.name, new Vector2(randomX, randomY))
      player.sprite.setActive(true)
      player.sprite.anims.play({ key: 'Idle', repeat: -1, frameRate: 10 })
      this.players.set(player, p as Player)
    })

    this.combatStore.enemies.forEach((e) => {
      let randomX = this.randomNumber(3, 10)
      let randomY = this.randomNumber(3, 10)
      if (this.enemies.size > 0) {
        while ([...this.enemies.keys(), ...this.players.keys()]
          .findIndex(v => v.getInitPosition().x === randomX && v.getInitPosition().y === randomY) !== -1) {
          randomX = this.randomNumber(3, 10)
          randomY = this.randomNumber(3, 10)
        }
      }
      const enemy = new GameEntity(this, e.name, new Vector2(randomX, randomY))
      enemy.sprite.setActive(true)
      enemy.sprite.anims.play({ key: 'Idle', repeat: -1, frameRate: 10 })
      this.enemies.set(enemy, e as Enemy)
    })

    const gridEngineConfig: GridEngineConfig = {
      characters: [
        ...Array.from(this.players.keys()).map(p => p.getCharacterConfig(['cg1'])),
        ...Array.from(this.enemies.keys()).map(e => e.getCharacterConfig(['cg1'])),
      ],
    }

    this.gridEngine.create(this.map, gridEngineConfig)

    this.gridEngine.movementStarted().subscribe(({ direction }) => {
      const currentEntity = this.getCurrentEntity()
      currentEntity.sprite.flipX = direction.includes('left')
      currentEntity.sprite.anims.play({ key: 'Run right', repeat: 1, frameRate: 10 })
    })

    this.gridEngine.movementStopped().subscribe(() => {
      this.playOnHealth(this.getCurrentEntity(), this.combatStore.currentEntity!)
      this.combatStore.passTurn()
    })

    this.unsubscribeCombatActions = this.combatStore.$onAction(({ name, args }) => {
      if (this.sceneStore.currentScene !== this.scene.key)
        return
      if (name === 'actionAttack') {
        const currentEntity = this.getCurrentEntity()
        currentEntity.sprite.anims.play({ key: 'Attack', repeat: 1, frameRate: 10 }).on('animationcomplete', () => {
          this.playOnHealth(this.getCurrentEntity(), this.combatStore.currentEntity!)
          if (this.combatStore.orderTurn.findIndex(v => (v instanceof Player)) === -1)
            this.combatStore.actionWin(false)

          else if (this.combatStore.orderTurn.findIndex(v => (v instanceof Enemy)) === -1) {
            const totalExp = this.combatStore.enemies.map(v => v.expReward).reduce((c, p) => c + p)
            this.sceneStore.party.forEach(v => v.addExp(totalExp / 5))
            this.combatStore.actionWin(true)
          }
          else
            this.combatStore.passTurn()
        })
        const targetEntity = Array.from([...this.players.keys(), ...this.enemies.keys()]).find(v => v.entityName === args[0].name)!
        targetEntity.sprite.anims.play({ key: 'Damage taken', repeat: 1, frameRate: 10 }).on('animationcomplete', () => {
          this.playOnHealth(targetEntity, args[0])
        })
      }
      if (name === 'actionInRange') {
        this.cleanAllTiles()
        if (args[0]) {
          const entityRange = this.combatStore.currentEntity?.range ?? 0
          const entityPos = this.getCurrentEntity().getPosition()
          this.tintRadius(entityPos.x, entityPos.y, entityRange, this.rangeColor)
          this.combatStore.inRangeEntities = this.checkEnemyInRange(entityRange)
        }
      }
      if (name === 'actionMove') {
        this.cleanAllTiles()
        if (args[0]) {
          const entityPos = this.getCurrentEntity().getPosition()
          this.newPos = new Vector2(entityPos.x, entityPos.y)
          this.tintRadius(entityPos.x, entityPos.y, 2, this.radiusColor)
          this.tintTile(entityPos.x, entityPos.y, this.selectionColor)
        }
      }
      if (name === 'changeDirection')
        this.newPos = this.moveTile(this.newPos.x, this.newPos.y, args[0])

      if (name === 'confirmMove') {
        const currentEntity = this.getCurrentEntity()
        const entityPos = currentEntity.getPosition()
        if (this.checkTile(this.newPos, new Vector2(entityPos.x, entityPos.y), 3)) {
          this.cleanAllTiles()
          currentEntity.movePlayerTo(this.newPos)
        }
      }
      if (name === 'actionWin') {
        if (args[0]) {
          this.combatStore.combatLog += 'Hai vinto!\n'
          Array.from(this.players.keys()).forEach(w => w.sprite.anims.play({ key: 'Victory', repeat: -1, frameRate: 10 }))
        }
        else {
          this.combatStore.combatLog += 'Hai perso!\n'
          Array.from(this.enemies.keys()).forEach(w => w.sprite.anims.play({ key: 'Victory', repeat: -1, frameRate: 10 }))
        }
        setTimeout(() => {
          this.sceneStore.changeScene('StageScene')
          if (args[0]) {
            const totalExp = this.combatStore.enemies.map(v => v.expReward).reduce((c, p) => c + p)
            console.log('Ogni giocatore ha ottenuto', totalExp / 5, 'di exp')
            this.sceneStore.party.forEach(v => v.addExp(totalExp / 5))
          }
          else
            this.sceneStore.party.forEach((p, i) => this.sceneStore.party[i].addHealth(p.maxHealth * 0.2))
        }, 3000)
      }
      if (name === 'getEnemyInRange')
        this.combatStore.inRangeEntities = this.checkEnemyInRange(args[0])

      if (name === 'moveEnemy') {
        const enemyPos = this.getCurrentEntity().getPosition()
        this.newPos = new Vector2(enemyPos.x, enemyPos.y)
        this.combatStore.changeDirection(args[0])
        if (this.checkTile(this.newPos, new Vector2(enemyPos.x, enemyPos.y), 3)) {
          this.cleanAllTiles()
          this.getCurrentEntity().moveEnemyTo(this.newPos)
        }
      }
    })

    this.sound.stopByKey('stageSong')
    if (this.stageStore.selectedNode === 10)
      this.sound.play('adminSong', { loop: true })
    else if (this.stageStore.selectedNode === 6)
      this.sound.play('regitareSong', { loop: true })
    else this.sound.play('combatSong', { loop: true })
  }

  playOnHealth(gameEntity: GameEntity, frontEntity: Entity) {
    if (frontEntity.isKo) {
      gameEntity.sprite.anims.play({ key: 'Defeat', repeat: 1, frameRate: 10 }).on('animationcomplete', () => {
        gameEntity.sprite.anims.play({ key: 'KO', repeat: frontEntity instanceof Enemy ? 1 : -1, frameRate: 10 })
          .on('animationcomplete', () => {
            if (frontEntity instanceof Enemy && this.gridEngine.hasCharacter(gameEntity.entityName)
              && !['Admin', 'Regitare'].includes(gameEntity.entityName)) {
              gameEntity.sprite.anims.stop()
              gameEntity.sprite.destroy()
              this.enemies.delete(gameEntity)
              this.gridEngine.removeCharacter(gameEntity.entityName)
            }
          })
      })
    }
    else if (frontEntity.isLowHP)
      gameEntity.sprite.anims.play({ key: 'Low HP', repeat: -1, frameRate: 10 })

    else
      gameEntity.sprite.anims.play({ key: 'Idle', repeat: -1, frameRate: 10 })
  }

  cleanAllTiles() {
    for (const arr of this.walkLayer.layer.data) {
      for (const tile of arr)
        tile.tint = this.cleanColor
    }
  }

  update() {

  }

  tintRadius(posX: number, posY: number, radius: number, color: number) {
    [posX, posY] = [posY, posX]
    for (let x = 0; x <= radius; x++) {
      for (let y = 0; y <= radius; y++) {
        if (this.manhattanDist(posX, posY, posX + x, posY + y) <= radius
          && (posX + x > 2 && posX + x < 11) && (posY + y > 2 && posY + y < 11))
          this.walkLayer.layer.data[posX + x][posY + y].tint = color

        if (this.manhattanDist(posX, posY, posX - x, posY + y) <= radius
          && (posX - x > 2 && posX - x < 11) && (posY + y > 2 && posY + y < 11))
          this.walkLayer.layer.data[posX - x][posY + y].tint = color

        if (this.manhattanDist(posX, posY, posX + x, posY - y) <= radius
          && (posX + x > 2 && posX + x < 11) && (posY - y > 2 && posY - y < 11))
          this.walkLayer.layer.data[posX + x][posY - y].tint = color

        if (this.manhattanDist(posX, posY, posX - x, posY - y) <= radius
          && (posX - x > 2 && posX - x < 11) && (posY - y > 2 && posY - y < 11))
          this.walkLayer.layer.data[posX - x][posY - y].tint = color
      }
    }
  }

  tintTile(posX: number, posY: number, color: number): void {
    this.walkLayer.layer.data[posY][posX].tint = color
  }

  moveTile(x: number, y: number, direction: string): Vector2 {
    const entityPos = this.getCurrentEntity().getPosition()
    const entityVet = new Vector2(entityPos.x, entityPos.y)
    switch (direction) {
      case 'left':
        if (this.checkTile(new Vector2(x - 1, y), entityVet, 3))
          this.tintTile(x, y, this.radiusColor)
        else this.tintTile(x, y, this.cleanColor)
        this.tintTile(x - 1, y, this.selectionColor)
        return new Vector2(x - 1, y)
      case 'right':
        if (this.checkTile(new Vector2(x + 1, y), entityVet, 3))
          this.tintTile(x, y, this.radiusColor)
        else this.tintTile(x, y, this.cleanColor)
        this.tintTile(x + 1, y, this.selectionColor)
        return new Vector2(x + 1, y)
      case 'up':
        if (this.checkTile(new Vector2(x, y - 1), entityVet, 3))
          this.tintTile(x, y, this.radiusColor)
        else this.tintTile(x, y, this.cleanColor)
        this.tintTile(x, y - 1, this.selectionColor)
        return new Vector2(x, y - 1)
      case 'down':
        if (this.checkTile(new Vector2(x, y + 1), entityVet, 3))
          this.tintTile(x, y, this.radiusColor)
        else this.tintTile(x, y, this.cleanColor)
        this.tintTile(x, y + 1, this.selectionColor)
        return new Vector2(x, y + 1)
      default:
        return new Vector2(x, y)
    }
  }

  checkTile(newPos: Phaser.Math.Vector2, initPos: Phaser.Math.Vector2, radius: number): boolean {
    return this.manhattanDist(initPos.x, initPos.y, newPos.x, newPos.y) < radius
  }

  checkEnemyInRange(radiusEntity: number) {
    const entity = this.getCurrentEntity()
    const posX = entity.getPosition().x
    const posY = entity.getPosition().y
    const isPlayer = this.players.has(entity)
    const entities: (Player | Enemy)[] = []
    if (isPlayer) {
      this.enemies.forEach((value, key) => {
        if (this.manhattanDist(posX, posY, key.getPosition().x, key.getPosition().y) <= radiusEntity)
          entities.push(value)
      })
    }
    else {
      this.players.forEach((value, key) => {
        if (this.manhattanDist(posX, posY, key.getPosition().x, key.getPosition().y) <= radiusEntity)
          entities.push(value)
      })
    }
    return entities
  }
}
