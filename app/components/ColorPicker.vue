<template>
	<UButton
		color="primary"
		variant="solid"
		:ui="{
			label: 'sr-only'
		}"
		@click="cycleColor"
	>
		<template #leadingIcon>
			<div class="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
				<div class="w-3 h-3 rounded-full relative" :style="{ backgroundColor: `var(--color-${currentColor}-500)` }">
					<div class="absolute inset-0 flex items-center justify-center text-[8px] text-white opacity-50">
						<i class="i-lucide-palette" />
					</div>
				</div>
			</div>
		</template>
	</UButton>
</template>

<script setup lang="ts">
	const appConfig = useAppConfig();

	type ColorOption = "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

	const colorOptions: ColorOption[] = [
		"red",
		"orange",
		"amber",
		"yellow",
		"lime",
		"green",
		"emerald",
		"teal",
		"cyan",
		"sky",
		"blue",
		"indigo",
		"violet",
		"purple",
		"fuchsia",
		"pink",
		"rose"
	];

	const currentColorIndex = ref(0);
	const currentColor = computed(() => colorOptions[currentColorIndex.value]);

	const cycleColor = () => {
		currentColorIndex.value = (currentColorIndex.value + 1) % colorOptions.length;
		appConfig.ui.colors.primary = currentColor.value;
	};
</script>
