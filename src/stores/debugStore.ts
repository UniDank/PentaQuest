import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDebugStore = defineStore('debug', () => {
  const currentFps = ref(0)
  const currentMouse = ref<{ x: number, y: number }>({ x: 0, y: 0 })
  const isFullscreen = ref(false)

  const toggleFullscreen = () => isFullscreen.value = !isFullscreen.value

  return { currentFps, currentMouse, isFullscreen, toggleFullscreen }
})
