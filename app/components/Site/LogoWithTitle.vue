<template>
	<div class="flex flex-col items-center">
		<UAvatar
			icon="local:logo"
			size="xl"
			color="primary"
			:ui="{
				root: 'group',
				icon: 'opacity-100 group-hover:opacity-100 transition-opacity duration-300'
			}"
		/>
		<div class="flex mt-2">
			<span
				v-for="(letter, index) in 'Buildit'"
				:key="index"
				class="text-xl font-bold text-primary transition-colors duration-300 cursor-pointer"
				:class="[
					{
						[`text-${hoverColors[index]}-500`]: hoverColors[index]
					}
				]"
				@mouseenter="handleLetterHover(index)"
				@mouseleave="handleLetterLeave(index)"
				@click="changeTheme(getColor(index))"
			>
				{{ letter }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
	type ColorOption = "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "slate" | "gray" | "zinc" | "neutral" | "stone";

	const appConfig = useAppConfig();
	const hoverColors = ref<Record<number, ColorOption>>({});
	const hoverTimeout = ref<Record<number, NodeJS.Timeout>>({});

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
		"rose",
		"slate",
		"gray",
		"zinc",
		"neutral",
		"stone"
	];

	const getRandomColor = (): ColorOption => {
		const randomIndex = Math.floor(Math.random() * colorOptions.length);
		const color = colorOptions[randomIndex];
		if (!color) throw new Error("Random color not found");
		return color;
	};

	const getColor = (index: number): ColorOption => {
		const color = colorOptions[index % colorOptions.length];
		if (!color) throw new Error("Color not found");
		return color;
	};

	const handleLetterHover = (index: number) => {
		// Clear any existing timeout for this letter
		if (hoverTimeout.value[index]) {
			clearTimeout(hoverTimeout.value[index]);
		}

		// Set a new random color for the letter
		const newColor = getRandomColor();
		hoverColors.value[index] = newColor;
		// Change the theme color once
		appConfig.ui.colors.primary = newColor;
	};

	const handleLetterLeave = (index: number) => {
		// Clear the timeout when mouse leaves
		if (hoverTimeout.value[index]) {
			clearTimeout(hoverTimeout.value[index]);
			delete hoverTimeout.value[index];
		}
		// Remove the hover color
		delete hoverColors.value[index];
	};

	const changeTheme = (color: ColorOption) => {
		appConfig.ui.colors.primary = color;
	};

	// Clean up timeouts on component unmount
	onUnmounted(() => {
		Object.values(hoverTimeout.value).forEach((timeout) => {
			clearTimeout(timeout);
		});
	});
</script>
