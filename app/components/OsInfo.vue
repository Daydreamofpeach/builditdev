<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center cursor-pointer" @click="isExpanded = !isExpanded">
        <UIcon name="i-lucide-monitor" class="text-primary text-2xl mr-2" />
        <h3 class="font-bold">Operating System</h3>
        <UIcon :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
      </div>
    </template>
    <div v-if="isExpanded" class="transition-all duration-300">
      <UAccordion :items="items" type="multiple" />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
const isExpanded = ref(true);
const items = ref([
  {
    label: "System",
    icon: "lucide:monitor",
    content: `${useTauriOsPlatform()} ${useTauriOsVersion()}`
  },
  {
    label: "Arch",
    icon: "lucide:microchip",
    content: useTauriOsArch()
  },
  {
    label: "Locale",
    icon: "lucide:globe",
    content: await useTauriOsLocale() || "Not detectable"
  }
]);
</script> 