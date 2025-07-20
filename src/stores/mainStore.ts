import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ClassType } from '../classes/Entity'
import { Item, ItemType } from '../classes/Inventory'
import { Player } from '../classes/Player'

export const useMainStore = defineStore('main', () => {
  const currentScene = ref('')
  const currentInterface = ref('')
  const showedDialogue = ref('')
  const mainPlayer = ref('')
  const currentVolume = ref(1)
  const passedData = ref<object | undefined>(undefined)
  const party = ref<Player[]>([
    new Player('Agoraco', 16, 17, 50, 10, 3, 2, 10, ClassType.Melee),
    new Player('Danblos', 25, 12, 50, 10, 5, 4, 10, ClassType.Mage),
    new Player('Marcurion', 18, 14, 50, 10, 10, 2, 10, ClassType.Thief),
    new Player('Gioxon', 20, 15, 50, 10, 4, 3, 10, ClassType.Archer),
    new Player('Claphos', 15, 20, 50, 10, 2, 1, 10, ClassType.Tank),
  ])
  const inventory = ref<Item[]>([
    new Item('Vita', ItemType.Health, 20, 10),
    new Item('Mana', ItemType.Mana, 15, 10),
    new Item('Energia', ItemType.Energy, 10, 10),
  ])

  const changeScene = (scene: string, data?: object) => {
    currentScene.value = scene
    passedData.value = data
  }

  const updateParty = (list: Player[]) => party.value = list

  const updateInventory = (list: Item[]) => inventory.value = list

  const changeInterface = (userInterface: string) => currentInterface.value = userInterface

  const closeInterface = () => currentInterface.value = ''

  const showDialogue = (dialogue: string) => showedDialogue.value = dialogue

  const changeVolume = (perc: number) => currentVolume.value = perc

  const selectPlayer = (player: string) => mainPlayer.value = player

  return {
    changeScene,
    showDialogue,
    currentScene,
    party,
    inventory,
    mainPlayer,
    selectPlayer,
    currentInterface,
    changeInterface,
    closeInterface,
    changeVolume,
    currentVolume,
    passedData,
    updateInventory,
    updateParty,
  }
})
