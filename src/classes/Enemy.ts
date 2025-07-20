import type { ClassType } from './Entity'
import { useCombatStore } from '../stores/combatStore'
import { Entity } from './Entity'

enum EnemyAction {
  Attack, Move, Pass,
}

class Enemy extends Entity {
  private combatStore = useCombatStore()

  constructor(
    public name: string,
    public attack: number,
    public defense: number,
    public health: number,
    public mana: number,
    public agility: number,
    public range: number,
    public expReward: number,
    public category: ClassType,
  ) {
    super(name, attack, defense, health, mana, agility, range, category)
  }

  private move(): void {
    const directions = ['up', 'right', 'left', 'down']
    const randomDir = Math.floor(Math.random() * 4)
    this.combatStore.moveEnemy(directions[randomDir])
  }

  public doAction(): void {
    const randomAction = Math.floor(Math.random() * 2)
    switch (randomAction) {
      case EnemyAction.Attack: {
        const enemiesInRange = this.combatStore.getEnemyInRange(this.range)
        if (enemiesInRange.length === 0) {
          this.move()
          break
        }
        const randomTarget = Math.floor(Math.random() * enemiesInRange.length)
        const takenDmg = this.setDamage(this.attack, enemiesInRange[randomTarget])
        this.combatStore.actionAttack(enemiesInRange[randomTarget])
        this.combatStore.combatLog += `${this.name} ha inflitto ${takenDmg} danni a ${enemiesInRange[randomTarget].name}!\n`
        if (enemiesInRange[randomTarget].isKo)
          this.combatStore.combatLog += `${enemiesInRange[randomTarget].name} è stato sconfitto!\n`
        else if (enemiesInRange[randomTarget].isLowHP)
          this.combatStore.combatLog += `${enemiesInRange[randomTarget].name} è in fin di vita!\n`
        break
      }
      case EnemyAction.Move:
        this.move()
        break
      case EnemyAction.Pass:
        this.combatStore.combatLog += `${this.name} ha saltato il turno!\n`
        this.combatStore.passTurn()
        break
      default:
        console.warn('Azione non valida!')
        break
    }
  }
}

export {
  Enemy,
}
