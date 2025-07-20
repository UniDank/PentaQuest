import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBootStore = defineStore('boot', () => {
  const selectedBtn = ref(-1)

  const selectButton = (index: number) => {
    let curIndex = selectedBtn.value + index
    if (curIndex >= 5)
      curIndex = 0
    else if (curIndex < 0)
      curIndex = 5 - 1
    selectedBtn.value = curIndex
  }

  const confirmButton = () => {}

  return { selectedBtn, selectButton, confirmButton }
})
