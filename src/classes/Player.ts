import type { ClassType } from './Entity'
import { Entity } from './Entity'

class Player extends Entity {
  public maxAPs: number
  public currentExp: number
  public level: number

  constructor(
    public name: string,
    public attack: number,
    public defense: number,
    public health: number,
    public mana: number,
    public agility: number,
    public range: number,
    public aps: number,
    public category: ClassType,
  ) {
    super(name, attack, defense, health, mana, agility, range, category)
    this.maxAPs = aps
    this.level = 1
    this.currentExp = 0
  }

  public addAPs(amount: number) {
    this.aps = Math.min(this.aps += amount, this.maxAPs)
  }

  public useAPs(amount: number): void {
    this.aps = Math.max(this.aps -= amount, 0)
  }

  public addExp(amount: number): void {
    this.currentExp += amount
    if (this.currentExp === 100) {
      this.currentExp = 0
      this.level += 1
      if (this.name === 'Claphos') {
        this.maxHealth += 10
        this.attack += 2
        this.defense += 4
        this.maxAPs += 1
        this.maxMana += 2
      }
      else if (this.name === 'Marcurion') {
        this.maxHealth += 3
        this.attack += 3
        this.defense += 1
        this.maxAPs += 4
        this.maxMana += 2
      }
      else if (this.name === 'Agoraco') {
        this.maxHealth += 5
        this.attack += 3
        this.defense += 3
        this.maxAPs += 2
        this.maxMana += 3
      }
      else if (this.name === 'Danblos') {
        this.maxHealth += 2
        this.attack += 5
        this.defense += 1
        this.maxAPs += 2
        this.maxMana += 5
      }
      else if (this.name === 'Gioxon') {
        this.maxHealth += 4
        this.attack += 4
        this.defense += 2
        this.maxAPs += 3
        this.maxMana += 3
      }
    }
  }
}

export {
  Player,
}
