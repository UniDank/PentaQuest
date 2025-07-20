<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import stories from '../assets/stories.json'
import { Item, ItemType } from '../classes/Inventory'
import { Player } from '../classes/Player'
import { useMainStore } from '../stores/mainStore'
import { useStageStore } from '../stores/stageStore'
import InventoryComp from './Inventory.vue'

interface Story {
  images: {
    name: string
    position: string
  }[]
  text: string[]
}

const main = useMainStore()
const stage = useStageStore()

const openStory = ref(false); const startText = ref('')
const showSettings = ref(false); const showSummary = ref(false)
const invComp = ref<InstanceType<typeof InventoryComp> | null>(null)
const volumeSlider = ref(main.currentVolume)
const currentStory = ref<Story>({ images: [], text: [] })

function setCurrentText(node: number) {
  if ([2, 4, 6, 10].includes(node))
    startText.value = 'Inizia<br/>la battaglia'
  else if ([1, 9, 12].includes(node))
    startText.value = 'Leggi<br/>il tutorial'
  else startText.value = 'Leggi<br/>la storia'
}

const getStory = computed(() => currentStory.value.text.map((text, i) => {
  return { text, image: currentStory.value.images[i] }
}))

setCurrentText(stage.selectedNode)

stage.$subscribe((store, vars) => setCurrentText(vars.selectedNode))

fetch(`http://localhost:8080/api/v1/party`).then(res => res.json()).then((json) => {
  if (json.status === '404')
    return
  const resultedPlayers: Player[] = []; const resultedItems: Item[] = []
  json.data.members.forEach((e: Player) => {
    const player: Player = new Player(e.name, e.attack, e.defense, e.health, e.mana, e.agility, e.range, e.aps, e.category)
    resultedPlayers.push(player)
  })
  json.data.bag.forEach((e: Item) => {
    const item: Item = new Item(e.name, e.type, e.quantity, e.value)
    resultedItems.push(item)
  })
  stage.selectedNode = json.data.id_stage ?? 0
  main.updateParty(resultedPlayers)
  main.updateInventory(resultedItems)
})

watch([openStory, showSummary, showSettings], () =>
  stage.enableNodes = !openStory.value && !showSummary.value && !showSettings.value)

function startBattle() {
  if ([2, 4, 6, 10].includes(stage.selectedNode))
    main.changeScene('CombatScene')

  else if (stories[stage.selectedNode].text.length > 0) {
    openStory.value = true
    currentStory.value = stories[stage.selectedNode] as Story
    if (stage.selectedNode === 7 && main.inventory.find(i => i.name === 'Lira') === undefined)
      main.inventory.push(new Item('Lira', ItemType.Lyre, 1, 1))
  }
}

function openInventory() {
  invComp.value?.toggleInv()
  showSettings.value = false
}

function openSettings() {
  showSettings.value = !showSettings.value
  invComp.value!.showInv = false
}

function saveExit() {
  // main.$reset()
  // stage.$reset()
  // main.changeScene('BootScene')
  // window.close()
  window.location.reload()
  // window.require('electron').ipcRenderer.invoke('close-window')
}
</script>

<template>
  <div class="rpgui-content">
    <div
      class="top-0 left-0 flex flex-col justify-between h-full p-1 rpgui-container"
      :class="{ 'pointer-events-none': openStory }"
    >
      <button
        :disabled="stage.playedStages.includes(stage.selectedNode)" class="!py-3 !px-12 rpgui-button"
        type="button" @click="startBattle"
      >
        <h4 v-html="startText" />
      </button>
      <div class="rpgui-container mt-1 !static framed right-2">
        <div
          v-for="(player, index) in main.party" class="!flex gap-1"
          :style="`top: ${index === 0 ? 0.25 : (index * 4.25) + 0.25}rem;`"
        >
          <div class="!static rpgui-container cool !p-0 h-16 w-16">
            <img :src="`/boxes/${player.name.toLowerCase()}_box.png`">
          </div>
          <div class="flex flex-col w-32 gap-1">
            <p class="h-4 leading-none">
              {{ player.name }}
            </p>
            <div class="rpgui-progress !h-4">
              <div class="rpgui-progress-track !h-4 !left-4 !right-4">
                <div
                  class="rpgui-progress-fill !top-[3px] !bottom-[3px] red"
                  :style="`width: ${player.health / player.maxHealth * 100}%;`"
                />
              </div>
              <div class="!h-4 !w-4 rpgui-progress-left1-edge" />
              <div class="!h-4 !w-4 rpgui-progress-right-edge" />
            </div>
            <div class="rpgui-progress !h-4">
              <div class="rpgui-progress-track !h-4 !left-4 !right-4">
                <div
                  class="rpgui-progress-fill !top-[3px] !bottom-[3px] green"
                  :style="`width: ${player.aps / player.maxAPs * 100}%;`"
                />
              </div>
              <div class="!h-4 !w-4 rpgui-progress-left2-edge" />
              <div class="!h-4 !w-4 rpgui-progress-right-edge" />
            </div>
          </div>
        </div>
      </div>
      <button class="!py-3 !px-12 relative !overflow-visible rpgui-button" type="button" @click="openInventory">
        <h3>Inventario</h3>
        <InventoryComp ref="invComp" />
      </button>
      <button class="!py-3 !px-12 rpgui-button" type="button" @click="showSummary = true">
        <h3>Glossario</h3>
      </button>
      <button class="!py-3 !px-12 rpgui-button relative !overflow-visible" type="button" @click="openSettings">
        <h3>Impostazioni</h3>
        <div
          v-show="showSettings" class="flex flex-col rpgui-container framed !left-[calc(100%+0.5rem)] !absolute !bottom-0 !z-30"
          @click.stop
        >
          <h1 data-text="Opzioni di gioco" class="text-stroke-3">
            Opzioni di gioco
          </h1>
          <div class="flex gap-4">
            <h2 data-text="Risoluzione:" class="text-stroke-3">
              Risoluzione:
            </h2>
            <div class="flex flex-col">
              <input class="rpgui-checkbox" type="checkbox" name="fullscreen">
              <label for="fullscreen">Schermo intero</label>
              <select class="text-lg rpgui-dropdown lg:text-2xl rpgui-cursor-point">
                <option value="1920x1080" class="text-lg !rpgui-cursor-point lg:text-2xl">
                  1920 x 1080
                </option>
                <option value="1280x720" class="text-lg !rpgui-cursor-point lg:text-2xl">
                  1280 x 720
                </option>
                <option value="1024x768" class="text-lg !rpgui-cursor-point lg:text-2xl">
                  1024 x 768
                </option>
                <option value="800x600" selected class="text-lg !rpgui-cursor-point lg:text-2xl">
                  800 x
                  600
                </option>
              </select>
            </div>
          </div>
          <div class="flex gap-4">
            <h2 data-text="Volume:" class="text-stroke-3">
              Volume:
            </h2>
            <input
              v-model="volumeSlider" class="rpgui-slider" type="range" min="0" max="100"
              @change="main.changeVolume(volumeSlider)"
            >
          </div>
        </div>
      </button>
      <button class="!py-3 !px-12 rpgui-button" type="button" @click="saveExit">
        <h3>Salva ed esci</h3>
      </button>
    </div>
    <div class="p-2 top-9 right-7 rpgui-container">
      <h1 class="text-stroke-5" data-text="Regno di Empaizo">
        Regno di Empaizo
      </h1>
    </div>
    <div v-if="openStory" class="top-0 left-0 w-full h-full rpgui-container">
      <div class="w-[70%] h-5/6 top-16 left-1/4 rpgui-container !overflow-y-auto framed !p-4">
        <template v-for="{ text, image } in getStory" :key="story">
          <img
            v-if="image.name !== ''" class="rounded-lg"
            :class="{ 'float-left mr-4 clear-right': image.position === 'left',
                      'float-right ml-4 clear-left': image.position === 'right',
                      'mx-auto clear-both': image.position === 'center' }"
            :src="`/stories/${image.name}`"
          >
          <h3 class="whitespace-pre-wrap" :class="{ 'text-center': [1, 7, 9, 12].includes(stage.selectedNode) }" v-html="text" />
        </template>
        <button class="ml-[87%] rpgui-button" type="button" @click="openStory = false">
          <h3>Chiudi</h3>
        </button>
      </div>
    </div>
    <div v-if="showSummary">
      <img class="fixed top-0 left-0 z-20 w-full h-auto" src="/Glossario.png">
      <div class="fixed z-20 top-6 left-[17%] w-[32%] flex flex-col gap-1.5 h-[90%]">
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/gioxon_box.png">
          <b>
            <span class="font-medium !leading-none">Gioxon</span> - unione di "Giorgio" e <b
              class="!font-['Basis'] text-base"
            >τόξον</b>, "tocson" (in greco arco) -
            Un arciere dalla lunga chioma, amico degli animali.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/marcurion_box.png">
          <b>
            <span class="font-medium !leading-none">Marcurion</span> - unione di "Marco" e <b
              class="!font-['Basis'] text-base"
            >ἀργύριον</b>, "argurion" (in greco danaro, moneta) -
            Un ladro di cui non si conosce l’identità, si pensa sia un goblin.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/claphos_box.png">
          <b>
            <span class="font-medium !leading-none">Claphos</span> - unione di "Claudio" e <b
              class="!font-['Basis'] text-base"
            >ξίφος</b>, "csiphos" (in greco spada) -
            Un guerriero che ha combattuto durante una antica guerra.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/map_box.png">
          <b>
            <span class="font-medium !leading-none">Regno di Empaizo</span> - da <b
              class="!font-['Basis'] text-base"
            >ἐμπαίζω</b>, "empaizo" (in greco giocare, scherzare) -
            Il regno in cui si svolge l’avventura di Penta Quest.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/ontos_box.png">
          <b>
            <span class="font-medium !leading-none">Villaggio di Òntos</span> - da <b
              class="!font-['Basis'] text-base"
            >ὄντος</b>, "ontos" (in greco realtà, genitivo di <b
              class="!font-['Basis'] text-base"
            >ὄν</b>, “on”) -
            Villaggio fittizio da cui dicono di provenire gli eroi, invece di dire la verità.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/alsos_box.png">
          <b>
            <span class="font-medium !leading-none">Bosco Àlsos</span> - da <b
              class="!font-['Basis'] text-base"
            >ἄλσος</b>, "alsos" (in greco bosco, selva, foresta) -
            Bosco del quale si raccontano favole ai bambini per tenerli lontani.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/end_box.png">
          <b>
            <span class="font-medium !leading-none !text-[#EE7F2E]">T.R.E.N.T.A.</span> - <span
              class="font-medium !leading-none"
            >“<span class="!text-[#EE7F2E]">T</span>erra <span
              class="!text-[#EE7F2E]"
            >R</span>icolma di <span class="!text-[#EE7F2E]">E</span>ffigi
              <span class="!text-[#EE7F2E]">N</span>efaste e <span class="!text-[#EE7F2E]">T</span>ombe
              <span class="!text-[#EE7F2E]">A</span>ntiche”</span> -
            Le lande a Nord-Ovest dove le leggende narrano si possano raggiungere i “Confini del
            Mondo”.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/hacker_box.png">
          <b>
            <span class="font-medium !leading-none">Hacker</span> - una persona che utilizza le proprie
            competenze informatiche per esplorare i dettagli di sistemi informatici e utilizzarli in modo
            malevolo.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/admin_box.png">
          <b>
            <span class="font-medium !leading-none">The Administrator</span> - un’entità che si
            autodefinisce Amministratore e che sostiene di avere il controllo sul Regno di Empaizo.<br>
          </b>
        </div>
      </div>
      <div class="fixed z-20 top-6 left-[51%] w-[32%] flex flex-col gap-1.5 h-[90%]">
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/danblos_box.png">
          <b>
            <span class="font-medium !leading-none">Danblos</span> - unione di "Daniele" e <b
              class="!font-['Basis'] text-base"
            >βίβλος</b>, "biblos" <br>(in greco libro) -
            Uno studioso che combatte col <br>potere della streoneria.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/agoraco_box.png">
          <b>
            <span class="font-medium !leading-none">Agoraco</span> - unione di "Federico" e <b
              class="!font-['Basis'] text-base"
            >ἀγορά</b>, "agorà" (in greco piazza, mercato) -
            Un mercante girovago, combatte usando la merce raccolta nei suoi viaggi.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/rombos_box.png">
          <b>
            <span class="font-medium !leading-none">Magnifica Maga Rombòs</span> - da <b
              class="!font-['Basis'] text-base"
            >ῥόμβος</b>, "rombos" (in greco oggetto magico, rombo) -
            Una chiaroveggente <br>che aiuta gli eroi nel momento del bisogno.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/didascal_box.png">
          <b>
            <span class="font-medium !leading-none">Villaggio di Didascalèion</span> - da <b
              class="!font-['Basis'] text-base"
            >διδασκαλεῖον</b>, "didascaleion" (in greco scuola) -
            Villaggio in cui <br>gli eroi si trovano appena arrivati.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/matetai_box.png">
          <b>
            <span class="font-medium !leading-none">Màtetai</span> - da <b
              class="!font-['Basis'] text-base"
            >μαθηταί</b>, "matetai" (in greco scolari, plurale di <b
              class="!font-['Basis'] text-base"
            >μαθητής</b> “matetes”) -
            Eroi valorosi in <br>grado di sconfiggere i mostri usando le arti magiche.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/regitare_box.png">
          <b>
            <span class="font-medium !leading-none">Regitare</span> - da <b
              class="!font-['Basis'] text-base"
            >rex,regis</b> (in latino re, sovrano) e <b
              class="!font-['Basis'] text-base"
            >θαρρέω</b>, "tarreo" (in greco essere coraggioso) - <br>
            Re famoso per la sua avventura nel Bosco Àlsos.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/lyre_box.png">
          <b>
            <span class="font-medium !leading-none !text-[#EE7F2E]">L.O.D.E.</span> - <span
              class="font-medium !leading-none"
            >“<span class="!text-[#EE7F2E]">L</span>ira <span
              class="!text-[#EE7F2E]"
            >O</span>scura <span class="!text-[#EE7F2E]">D</span>ell’<span
              class="!text-[#EE7F2E]"
            >E</span>dera”</span> -
            Uno strumento <br>che, secondo una favola raccontata dalla Maga <br>Rombòs, gode di poteri
            magici curativi benefici.<br>
          </b>
        </div>
        <div class="flex gap-2">
          <img class="rpgui-container !static thin !p-0" src="/boxes/bug_box.png">
          <b>
            <span class="font-medium !leading-none">Bug</span> e <span
              class="font-medium !leading-none"
            >Glitch</span> - L'Hacker ha sfruttato dei Bug nel sistema
            per impostare il proprio Account come Amministratore, <br>e attacca gli eroi in battaglia
            sfruttando dei Glitch.<br>
          </b>
        </div>
      </div>
      <button class="fixed z-20 bottom-4 right-4 rpgui-button" type="button" @click="showSummary = false">
        <h3>Chiudi</h3>
      </button>
    </div>
  </div>
</template>
