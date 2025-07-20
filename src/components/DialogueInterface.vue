<script setup lang="ts">
import { ref } from 'vue'
import { Dialogue } from '../classes/Dialogue'
import { useMainStore } from '../stores/mainStore'

const main = useMainStore()

const showOverlay = ref(false)
const currentName = ref(''); const currentText = ref('')

let dialogueScript: Dialogue

main.$onAction(({ name, args }) => {
  if (name === 'showDialogue') {
    // console.log(args[0])
    const textScript = `[Federico] Ciao sono fortissimo !\n[Claudio] No, io sono fortissimo !\n[Daniele] Ma andate a cagare !`
    dialogueScript = new Dialogue(textScript, false)
    currentName.value = dialogueScript.getSpeaker()
    currentText.value = dialogueScript.getNextLine()
    showOverlay.value = true
  }
})

function goOnScript() {
  currentName.value = dialogueScript.getSpeaker()
  currentText.value = dialogueScript.getNextLine()
  if (currentText.value === '')
    showOverlay.value = false
}
</script>

<template>
  <div v-if="showOverlay" class="rpgui-content">
    <div class="bottom-28 left-[10%] rpgui-container framed w-1/4 h-[5.5rem] !text-white">
      <h4>{{ currentName }}</h4>
    </div>
    <div class="bottom-4 left-1/2 -translate-x-1/2 relative rpgui-container framed w-4/5 h-32 !text-white" @click="goOnScript">
      <h4>{{ currentText }}</h4>
    </div>
  </div>
</template>
