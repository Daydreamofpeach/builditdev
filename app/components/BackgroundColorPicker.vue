<template>
  <div class="relative inline-block">
    <UButton icon="i-lucide-palette" size="xs" color="primary" variant="ghost" @click="toggleSelect" ref="buttonRef" />
    <div v-if="showSelect" class="absolute z-50 mt-2 left-0 min-w-[100px] bg-gray-900 rounded shadow-lg p-2" @click.outside="closeSelect">
      <USelect
        v-model="currentNeutral"
        :items="colorOptions.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))"
        variant="subtle"
        size="xs"
        class="w-full"
        @update:model-value="onSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const appConfig = useAppConfig();

const colorOptions = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
];

const currentNeutral = ref(appConfig.ui.colors.neutral);
const showSelect = ref(false);
const buttonRef = ref();

function updateNeutral() {
  appConfig.ui.colors.neutral = currentNeutral.value;
  document.documentElement.style.setProperty(
    "--ui-color-neutral-500",
    `var(--ui-color-${currentNeutral.value}-500)`
  );
  document.documentElement.style.setProperty(
    "--ui-color-neutral-950",
    `var(--ui-color-${currentNeutral.value}-950)`
  );
  document.documentElement.style.setProperty(
    "--color-neutral",
    `var(--ui-color-${currentNeutral.value}-500)`
  );
}

function toggleSelect() {
  showSelect.value = !showSelect.value;
}
function closeSelect() {
  showSelect.value = false;
}
function onSelect() {
  updateNeutral();
  closeSelect();
}
onMounted(updateNeutral);
</script> 