<template>
  <div>
    <label for="neutral-picker" class="sr-only">Background/Neutral Color</label>
    <select id="neutral-picker" v-model="currentNeutral" @change="updateNeutral" class="bg-neutral text-primary rounded px-2 py-1">
      <option v-for="color in colorOptions" :key="color" :value="color">
        {{ color }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const colorOptions = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
];

const currentNeutral = ref(appConfig.ui.colors.neutral);

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
onMounted(updateNeutral);
</script> 