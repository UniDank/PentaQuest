<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CombatInterface from './components/CombatInterface.vue'
import DebugInterface from './components/DebugInterface.vue'
import DialogueInterface from './components/DialogueInterface.vue'
import MainMenu from './components/MainMenu.vue'
import SelectInterface from './components/SelectInterface.vue'

import StageInterface from './components/StageInterface.vue'
import { launch } from './game/game'

import { useMainStore } from './stores/mainStore'

const sceneStore = useMainStore()
const selectedInterface = ref(0)

sceneStore.$onAction(({ name, args }) => {
  if (name === 'closeInterface')
    selectedInterface.value = 0
  if (name === 'changeInterface' && args[0] === 'MainMenu')
    selectedInterface.value = 1
  if (name === 'changeInterface' && args[0] === 'SelectInterface')
    selectedInterface.value = 2
  if (name === 'changeInterface' && args[0] === 'StageInterface')
    selectedInterface.value = 3
  if (name === 'changeInterface' && args[0] === 'CombatInterface')
    selectedInterface.value = 4
})

const gameInstance = ref<Phaser.Game>()
const computedGame = computed({
  get: () => gameInstance.value,
  set: value => gameInstance.value = value,
})
const containerId = 'game-container'

onMounted(() => {
  computedGame.value = launch(containerId)
})

onUnmounted(() => {
  computedGame.value?.destroy(false)
})
</script>

<template>
  <div :id="containerId" />
  <MainMenu v-if="selectedInterface === 1" />
  <DebugInterface />
  <DialogueInterface />
  <SelectInterface v-if="selectedInterface === 2" />
  <StageInterface v-if="selectedInterface === 3" />
  <CombatInterface v-if="selectedInterface === 4" />
</template>

<style>
  @import url('./assets/main.css');
@import url('./assets/rpgui.css');
</style>
