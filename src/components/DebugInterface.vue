<script setup lang="ts">
import fsEnter from '@iconify-icons/ic/round-fullscreen'
import fsExit from '@iconify-icons/ic/round-fullscreen-exit'
import { Icon } from '@iconify/vue/dist/offline'
import { useDebugStore } from '../stores/debugStore'

const debug = useDebugStore()
</script>

<template>
  <p
    class="fixed left-0 pl-1 text-[#00FF00] top-0 text-stroke-3 z-50 select-none rpgui-cursor-default"
    :data-text="`FPS: ${debug.currentFps.toFixed(0)}`"
  >
    FPS: {{ debug.currentFps.toFixed(0) }}
  </p>
  <button class="fixed top-0 right-0 rpgui-cursor-point" @click="debug.toggleFullscreen">
    <Icon v-if="!debug.isFullscreen" :icon="fsEnter" width="48" height="48" />
    <Icon v-if="debug.isFullscreen" :icon="fsExit" width="48" height="48" />
  </button>
  <p
    class="fixed left-0 pl-1 text-[#00FF00] bottom-0 z-50 text-stroke-3 select-none rpgui-cursor-default"
    :data-text="`Mouse: x: ${debug.currentMouse.x.toFixed(0)} | y: ${debug.currentMouse.y.toFixed(0)}`"
  >
    Mouse: x: {{ debug.currentMouse.x.toFixed(0) }} | y: {{ debug.currentMouse.y.toFixed(0) }}
  </p>
</template>
