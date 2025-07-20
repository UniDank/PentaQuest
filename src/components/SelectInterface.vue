<script setup lang="ts">
import { useMainStore } from '../stores/mainStore'

const main = useMainStore()
</script>

<template>
  <div class="rpgui-content">
    <div class="left-0 flex justify-around w-full top-1/4 rpgui-container">
      <h2 class="text-center text-stroke-5" data-text="Gioxon">
        Gioxon
      </h2>
      <h2 class="text-center text-stroke-5" data-text="Danblos">
        Danblos
      </h2>
      <h2 class="text-center text-stroke-5" data-text="Marcurion">
        Marcurion
      </h2>
      <h2 class="text-center text-stroke-5" data-text="Agoraco">
        Agoraco
      </h2>
      <h2 class="text-center text-stroke-5" data-text="Claphos">
        Claphos
      </h2>
    </div>
    <div class="bottom-0 left-0 flex flex-col gap-2 p-8 rpgui-container">
      <button class="self-start rpgui-button" type="button" @click="main.changeScene('BootScene')">
        <h3>Indietro</h3>
      </button>
    </div>
  </div>
</template>
