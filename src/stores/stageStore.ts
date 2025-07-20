import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStageStore = defineStore('stage', () => {
  const selectedNode = ref(0)
  const playedStages = ref<number[]>([])
  const enableNodes = ref(true)

  const selectNode = (node: number) => selectedNode.value = node

  const addPlayedStage = (id: number) => playedStages.value.push(id)

  return { selectedNode, selectNode, playedStages, addPlayedStage, enableNodes }
})
