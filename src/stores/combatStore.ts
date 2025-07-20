import type { Entity } from '../classes/Entity'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Enemy } from '../classes/Enemy'
import { ClassType } from '../classes/Entity'

export const useCombatStore = defineStore('combat', () => {
  const moveMode = ref(false)
  const moveDirection = ref('')
  const enemies = ref<Enemy[]>([
    new Enemy('Bidoof', 5, 5, 20, 10, 3, 20, 1, ClassType.Tank),
    new Enemy('Ekans', 10, 7, 25, 10, 6, 20, 2, ClassType.Thief),
    new Enemy('Starly', 7, 6, 23, 10, 9, 30, 4, ClassType.Mage),
    new Enemy('Carnivine', 8, 4, 18, 8, 7, 25, 3, ClassType.Archer),
  ])
  const combatLog = ref('')
  const isMoving = ref(false)
  const isCheckingRange = ref(false)
  const currentTurn = ref(0)
  const inRangeEntities = ref<Entity[]>([])
  const orderTurn = ref<Entity[]>([])
  const currentEntity = ref<Entity>()

  const toggleMoveMode = () => moveMode.value = !moveMode.value

  const actionMove = (move: boolean) => isMoving.value = move

  const actionInRange = (checkingRange: boolean) => isCheckingRange.value = checkingRange

  const updateEnemies = (list: Enemy[]) => enemies.value = list

  const updateCombatLog = (value: string) => combatLog.value += value

  const passTurn = () => {
    orderTurn.value = orderTurn.value.filter(v => v.health > 0)
    currentTurn.value = (currentTurn.value + 1) >= orderTurn.value.length ? 0 : currentTurn.value + 1
    currentEntity.value = orderTurn.value[currentTurn.value]
    return currentTurn.value
  }

  const actionAttack = (targetName: Entity) => {}

  const actionWin = (winners: boolean) => {}

  const changeDirection = (direction: string) => moveDirection.value = direction

  const confirmMove = () => {}

  const getEnemyInRange = (range: number) => inRangeEntities.value

  const moveEnemy = (direction: string) => {}

  return {
    moveMode,
    toggleMoveMode,
    moveDirection,
    actionAttack,
    currentEntity,
    enemies,
    combatLog,
    actionMove,
    isMoving,
    orderTurn,
    currentTurn,
    updateEnemies,
    updateCombatLog,
    inRangeEntities,
    actionInRange,
    isCheckingRange,
    passTurn,
    actionWin,
    changeDirection,
    confirmMove,
    getEnemyInRange,
    moveEnemy,
  }
})
