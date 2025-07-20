<script setup lang="ts">
import type { Item } from '../classes/Inventory'
import arrowLeft from '@iconify-icons/ic/round-arrow-left'
import arrowRight from '@iconify-icons/ic/round-arrow-right'
import { Icon } from '@iconify/vue/dist/offline'
import { ref, watch } from 'vue'
import { ItemType } from '../classes/Inventory'
import { Player } from '../classes/Player'
import { useCombatStore } from '../stores/combatStore'
import { useMainStore } from '../stores/mainStore'
import { useStageStore } from '../stores/stageStore'

const main = useMainStore()
const combat = useCombatStore()
const stage = useStageStore()

const show = ref(false)

const numPages = Math.ceil(main.inventory.length / 5)
const currentPage = ref(0)

watch(currentPage, () => addList.value.fill(false))

const addList = ref<boolean[]>(main.inventory.map(() => false))

function toggleInv() {
  stage.enableNodes = show.value
  show.value = !show.value
  if (show.value === false)
    addList.value.fill(false)
}

function showPlayers(index: number) {
  addList.value.fill(false)
  addList.value[index] = true
}

function addToPlayer(item: Item, player: Player) {
  if (combat.currentEntity instanceof Player) {
    if (combat.currentEntity.aps <= 0) {
      combat.combatLog += `${combat.currentEntity!.name} non ha abbastanza energia!\n`
      return
    }
    combat.currentEntity.useAPs(1)
  }
  if (item.type === ItemType.Health && player.health > 0 && player.health !== player.maxHealth) {
    player.addHealth(item.value)
    item.quantity -= 1
    combat.combatLog += `${player.name} ha usato una pozione di vita!\n`
  }
  else if (item.type === ItemType.Mana && player.mana !== player.maxMana) {
    player.addMana(item.value)
    item.quantity -= 1
    combat.combatLog += `${player.name} ha usato una pozione di mana!\n`
  }
  else if (item.type === ItemType.Lyre && player.health <= 0) {
    player.addHealth(player.maxHealth)
    player.addMana(player.maxMana)
    player.addAPs(player.maxAPs)
    combat.combatLog += `${player.name} ha usato la Lira!\n`
  }
  else if (item.type === ItemType.Energy && player.aps > 0 && player.aps !== player.maxAPs) {
    player.addAPs(item.value)
    item.quantity -= 1
    combat.combatLog += `${player.name} ha usato una pozione di energia!\n`
  }
  combat.passTurn()
  main.inventory = main.inventory.filter(v => v.quantity > 0)
}

defineExpose({
  toggleInv,
  showInv: show,
})
</script>

<template>
  <div
    v-show="show" class="rpgui-container framed !left-[calc(100%+0.5rem)] !absolute !bottom-0 !z-30 flex flex-col !h-56 w-52 !p-0"
    @click.stop
  >
    <div
      v-for="(item, index) in main.inventory.slice(currentPage * 5, (currentPage + 1) * 5)"
      class="flex items-center justify-between gap-1 px-1 py-1 hover:bg-black/75" @click="showPlayers(index)"
    >
      <div class="rpgui-icon !w-6 !h-6" :class="item.type" />
      <h5>{{ item.name }}</h5>
      <h5>{{ item.type === ItemType.Lyre ? '' : `x${item.quantity}` }}</h5>
    </div>
    <div class="flex items-center justify-between gap-1 mt-auto">
      <button class="rpgui-button !py-0 !px-3" type="button" @click="currentPage = Math.max(currentPage -= 1, 0)">
        <Icon :icon="arrowLeft" class="w-8 h-8" />
      </button>
      <h5>{{ currentPage + 1 }} di {{ numPages }}</h5>
      <button
        class="rpgui-button !py-0 !px-3" type="button"
        @click="currentPage = Math.min(currentPage += 1, numPages - 1)"
      >
        <Icon :icon="arrowRight" class="w-8 h-8" />
      </button>
    </div>
    <div
      v-show="addList.some(v => v)"
      class="rpgui-container framed !absolute !left-[calc(100%+0.75rem)] !-bottom-4 !z-30 flex flex-col gap-1 !h-auto w-44 !p-0"
    >
      <div
        v-for="player in main.party"
        class="relative flex items-center gap-2 px-1 py-1 hover:bg-black/75"
        @click="addToPlayer(main.inventory[addList.findIndex(v => v)], player)"
      >
        <img :src="`/boxes/${player.name.slice(0, player.name.includes(' ') ? player.name.lastIndexOf(' ') : undefined).toLowerCase()}_box.png`" class="w-8 h-8">
        <h5>{{ player.name }}</h5>
      </div>
    </div>
  </div>
</template>
