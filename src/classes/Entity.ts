enum ClassType {
  Archer,
  Tank,
  Thief,
  Mage,
  Unknown,
  Melee,
}

class Entity {
  public maxHealth: number
  public maxMana: number
  public isLowHP = false
  public isKo = false

  constructor(public name: string, public attack: number, public defense: number, public health: number, public mana: number, public agility: number, public range: number, public category: ClassType) {
    this.maxHealth = health
    this.maxMana = mana
  }

  public setDamage(amount: number, target: Entity): number {
    const damage = Math.ceil(Math.max(amount - (target.defense / 2), 0))
    target.health = Math.max(target.health -= damage, 0)
    target.isLowHP = (target.health / target.maxHealth * 100) <= 20
    target.isKo = target.health === 0
    return damage
  }

  public addHealth(amount: number) {
    this.health = Math.min(this.health += amount, this.maxHealth)
  }

  public addMana(amount: number) {
    this.mana = Math.min(this.mana += amount, this.maxMana)
  }

  public useMana(amount: number): void {
    this.mana = Math.max(this.mana -= amount, 0)
  }
}

export {
  ClassType,
  Entity,
}
