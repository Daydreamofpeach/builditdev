<template>
  <UFormField label="" name="neutralColor">
    <USelect
      v-model="currentNeutral"
      :items="colorOptions.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))"
      variant="subtle"
      size="lg"
      class="max-w-[120px] min-w-[120px]"
      @update:model-value="updateNeutral"
    />
  </UFormField>
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