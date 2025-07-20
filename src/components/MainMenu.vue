<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useBootStore } from '../stores/bootStore'
import { useMainStore } from '../stores/mainStore'

const boot = useBootStore()
const main = useMainStore()

const isFullScreen = ref(false)

const textButtons = ['Nuova Partita', 'Continua', 'Impostazioni', 'Crediti', 'Esci']
const selectedBtn = ref(-1)
const disabledBtn = ref(1)
const currentMenu = ref(0)
const volumeSlider = ref(main.currentVolume)

const selectAudio = new Audio('./src/game/assets/select_button.mp3')
const switchAudio = new Audio('./src/game/assets/switch_button.mp3')
selectAudio.volume = volumeSlider.value / 100
switchAudio.volume = volumeSlider.value / 100

watch(volumeSlider, () => {
  selectAudio.volume = volumeSlider.value / 100
  switchAudio.volume = volumeSlider.value / 100
})

main.$subscribe((store, vars) => volumeSlider.value = vars.currentVolume)

function toggleFullscreen() {
  isFullScreen.value = !isFullScreen.value

  const root = document.documentElement
  if (!document.fullscreenEnabled)
    return

  if (isFullScreen.value)
    root.requestFullscreen()
  else document.exitFullscreen()
  // window.require('electron').ipcRenderer.invoke('toggle-fullscreen', isFullScreen.value)
}

function overText(index: number) {
  if (disabledBtn.value === index)
    return
  if (selectedBtn.value !== index) {
    switchAudio.currentTime = 0
    switchAudio.play()
  }
  selectedBtn.value = index
}

function goBack() {
  currentMenu.value = 0
  selectedBtn.value = -1
}

function clickText(index: number) {
  if (disabledBtn.value === index)
    return
  selectAudio.currentTime = 0
  selectAudio.play()
  switch (index) {
    case 0:
      main.changeScene('SelectScene')
      break
    case 1:
      main.changeScene('StageScene', { selectedPlayer: main.mainPlayer })
      break
    case 2:
      currentMenu.value = 3
      break
    case 3:
      currentMenu.value = 4
      break
    case 4:
      boot.$reset()
      window.close()
      // window.require('electron').ipcRenderer.invoke('close-window')
      break
    default:
      break
  }
}

function menuSelect(e: KeyboardEvent) {
  e.preventDefault()
  if (currentMenu.value === 0) {
    if (['Enter', ' '].includes(e.key))
      clickText(selectedBtn.value)
    if (e.key === 'ArrowUp') {
      let index = selectedBtn.value
      if (index <= 0)
        index = textButtons.length - 1
      else if ((index - 1) === disabledBtn.value)
        index -= 2
      else index--
      selectedBtn.value = index
      switchAudio.currentTime = 0
      switchAudio.play()
    }
    if (e.key === 'ArrowDown') {
      let index = selectedBtn.value
      if (index >= textButtons.length - 1)
        index = 0
      else if ((index + 1) === disabledBtn.value)
        index += 2
      else index++
      selectedBtn.value = index
      switchAudio.currentTime = 0
      switchAudio.play()
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', menuSelect)
})

onMounted(async () => {
  fetch(`http://localhost:8080/api/v1/select`).then(res => res.json()).then((json) => {
    if (json.status === '200') {
      disabledBtn.value = -1
      main.selectPlayer(json.data.mainPlayer)
    }
  })
  window.addEventListener('keydown', menuSelect)
})
</script>

<template>
  <div class="rpgui-content">
    <div v-if="currentMenu === 0" class="top-1/2 left-0 pl-8 translate-y-[-25%] rpgui-container">
      <h1
        v-for="(text, i) in textButtons" :key="text" :class="[selectedBtn === i ? '!text-red-600' : (disabledBtn === i ? '!text-neutral-400' : '!text-white')]" class="mb-2 select-none lg:mb-4 w-fit text-stroke-5"
        :data-text="text"
        @pointerover="overText(i)" @pointerup="clickText(i)"
      >
        {{ text }}
      </h1>
    </div>
    <div v-if="currentMenu === 3" class="rpgui-container !top-1/3 left-0 pl-8 flex flex-col gap-4">
      <h1 data-text="Opzioni di gioco" class="text-stroke-5">
        Opzioni di gioco
      </h1>
      <div class="flex gap-4">
        <h2 data-text="Risoluzione:" class="text-stroke-3">
          Risoluzione:
        </h2>
        <div class="flex flex-col">
          <input
            v-model="isFullScreen" class="rpgui-checkbox" type="checkbox" name="fullscreen"
            @click="toggleFullscreen"
          >
          <label for="fullscreen" class="text-stroke-3" data-text="Schermo intero">Schermo intero</label>
          <select class="text-lg rpgui-dropdown lg:text-2xl rpgui-cursor-point">
            <option value="1920x1080" class="text-lg !rpgui-cursor-point lg:text-2xl">
              1920 x 1080
            </option>
            <option value="1280x720" selected class="text-lg !rpgui-cursor-point lg:text-2xl">
              1280 x 720
            </option>
            <option value="1024x768" class="text-lg !rpgui-cursor-point lg:text-2xl">
              1024 x 768
            </option>
            <option value="800x600" class="text-lg !rpgui-cursor-point lg:text-2xl">
              800 x 600
            </option>
          </select>
        </div>
      </div>
      <div class="flex gap-4">
        <h2 data-text="Volume:" class="text-stroke-3">
          Volume:
        </h2>
        <input v-model="volumeSlider" class="rpgui-slider" type="range" min="0" max="100" @change="main.changeVolume(volumeSlider)">
      </div>
      <button class="self-start rpgui-button" type="button" @click="goBack">
        <h3>Indietro</h3>
      </button>
    </div>
    <div v-if="currentMenu === 4" class="bottom-0 left-0 flex flex-col gap-2 p-8 rpgui-container">
      <div
        class="flex flex-col w-[95%] gap-2 p-8 -translate-x-1/2 -translate-y-2/3 h-3/5 top-2/3 left-1/2 rpgui-container framed-golden-2"
      >
        <h3>
          Il gioco è stato sviluppato da
          <a href="https://github.com/FedeDC512" target="_blank">Agnello Federico</a>,
          <a href="https://github.com/xClaudi0" target="_blank">Bellanti Claudio</a>,
          <a href="https://github.com/zAlweNy26" target="_blank">Nicosia Daniele</a>,
          <a href="https://github.com/valentimarco" target="_blank">Valenti Marco</a> e
          <a href="https://github.com/GiorgioZa" target="_blank">Zangara Giorgio</a>
          come progetto del Corso di Ingegneria e Sicurezza del Software 2022/2023 della
          <a
            href="https://www.unipa.it/dipartimenti/matematicaeinformatica/cds/informatica2086"
            target="_blank"
          >Facoltà di Informatica dell’Università di Palermo</a>
          con la supervisione della professoressa
          <a href="https://www.unipa.it/persone/docenti/r/simonaester.rombo" target="_blank">Simona Ester
            Rombo</a>.<br>
          Per i contatti o per segnalare errori è disponibile il link al
          <a href="https://github.com/UniDank/ProgettoPentagono" target="_blank">GitHub del
            Progetto</a>.<br>
          L'immagine del titolo "<span class="!text-[#EE7F2E]">Penta Quest</span>", il logo animato
          e la "<span class="!text-[#EE7F2E]">Lira Oscura Dell’Edera</span>" sono immagini originali create
          esclusivamente per il progetto.
          Il resto di immagini, sprite, animazioni e musiche non sono di nostra proprietà, tutti i diritti
          sono riservati ai rispettivi creatori.<br>
          I <span class="!text-blue-500">Programmi</span>,
          <span class="!text-red-500">Linguaggi</span> e
          <span class="!text-green-500">Librerie</span> usati per la realizzazione sono stati:
          <span class="!text-blue-500">Draw.io, IntelliJ, VSCode, Spring, JUnit, GitHub, Git, NodeJS, Notion,
            Asana, Aseprite</span>,
          <span class="!text-red-500">Java, TypeScript, JavaScript, HTML, CSS, MongoDB</span>,
          <span class="!text-green-500">Electron, Vue, Phaser, Tailwind, RPGUI, Vite, Pinia</span>.<br>
          Per un'esperienza ottimale si consiglia di giocare con volume attivo e dimensione della finestra
          fissa a <span class="!text-yellow-500">1280x720</span>.
        </h3>
      </div>
      <button class="self-start rpgui-button" type="button" @click="goBack">
        <h3>Indietro</h3>
      </button>
    </div>
  </div>
</template>
