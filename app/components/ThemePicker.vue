<template>
	<div>
		<UButton
			color="primary"
			variant="link"
			icon="i-lucide-settings"
			class="h-12 animate-spin [animation-duration:3s] infinite w-12"
			size="xl"
			@click="open = true"
		/>

		<UModal
			v-model:open="open"
			title="Theme Settings"
			description="Customize your application's theme colors"
			:ui="{ footer: 'justify-end' }"
		>
			<template #body>
				<div class="space-y-4">
					<UFormField label="Primary Color" name="primaryColor">
						<USelect
							v-model="primaryColor"
							:items="colorOptions"
							variant="subtle"
							size="lg"
							class="w-full"
							@update:model-value="updateTheme"
						/>
					</UFormField>
					<UFormField label="Neutral Color" name="neutralColor">
						<USelect
							v-model="neutralColor"
							:items="colorOptions"
							variant="subtle"
							size="lg"
							class="w-full"
							@update:model-value="updateTheme"
						/>
					</UFormField>

					<UDivider />

					<div class="space-y-4">
						<h3 class="text-lg font-medium">
							Fluid Cursor Controls
						</h3>
						<div class="flex flex-wrap gap-2">
							<UButton
								variant="ghost"
								@click="toggleFluid"
							>
								{{ isFluidEnabled ? 'Disable Fluid' : 'Enable Fluid' }}
							</UButton>
							<UButton
								variant="ghost"
								@click="randomizeFluidSettings"
							>
								Randomize Fluid
							</UButton>
							<UButton
								variant="ghost"
								@click="openSettings"
							>
								Fluid Settings
							</UButton>
						</div>
					</div>
				</div>
			</template>

			<template #footer>
				<UButton
					color="neutral"
					variant="outline"
					@click="open = false"
				>
					Close
				</UButton>
			</template>
		</UModal>

		<FluidSettingsSlideover
			v-if="showSettings"
			:settings="fluidSettings"
			@update:settings="handleSettingsUpdate"
			@close="showSettings = false"
		/>
	</div>
</template>

<script setup lang="ts">
	import { watch } from "vue";
	import FluidSettingsSlideover from "~/components/Design/FluidSettingsSlideover.vue";
	import { useFluidCursorState } from "~/composables/useFluidCursorState";

	const open = ref(false);
	const appConfig = useAppConfig();
	const showSettings = ref(false);
	const { isFluidEnabled, fluidCursor, toggleFluid, fluidSettings, updateSettings, initializeFluidCursor } = useFluidCursorState();

	const colorOptions = [
		{ label: "Slate", value: "slate" },
		{ label: "Gray", value: "gray" },
		{ label: "Zinc", value: "zinc" },
		{ label: "Neutral", value: "neutral" },
		{ label: "Stone", value: "stone" },
		{ label: "Red", value: "red" },
		{ label: "Orange", value: "orange" },
		{ label: "Amber", value: "amber" },
		{ label: "Yellow", value: "yellow" },
		{ label: "Lime", value: "lime" },
		{ label: "Green", value: "green" },
		{ label: "Emerald", value: "emerald" },
		{ label: "Teal", value: "teal" },
		{ label: "Cyan", value: "cyan" },
		{ label: "Sky", value: "sky" },
		{ label: "Blue", value: "blue" },
		{ label: "Indigo", value: "indigo" },
		{ label: "Violet", value: "violet" },
		{ label: "Purple", value: "purple" },
		{ label: "Fuchsia", value: "fuchsia" },
		{ label: "Pink", value: "pink" },
		{ label: "Rose", value: "rose" },
		{ label: "Black", value: "black" },
		{ label: "White", value: "white" }
	];

	const primaryColor = ref(appConfig.ui.colors.primary);
	const neutralColor = ref(appConfig.ui.colors.neutral);

	// Tauri store for theme persistence
	let themeStore: any = null;

	function applyTheme(primary: string, neutral: string) {
		appConfig.ui.colors.primary = primary;
		appConfig.ui.colors.neutral = neutral;
		// Optionally, update CSS variables or document style if needed
	}

	async function loadThemeFromStore() {
		try {
			themeStore = await useTauriStoreLoad("theme.bin", { autoSave: true });
			const themeSettings = await themeStore.get("themeSettings");
			if (themeSettings) {
				const { primary, neutral } = themeSettings;
				if (primary) primaryColor.value = primary;
				if (neutral) neutralColor.value = neutral;
				if (primary || neutral) {
					applyTheme(primaryColor.value, neutralColor.value);
				}
			}
		} catch (error) {
			console.error("Failed to load theme from store:", error);
		}
	}

	async function saveThemeToStore() {
		if (!themeStore) return;
		try {
			await themeStore.set("themeSettings", {
				primary: primaryColor.value,
				neutral: neutralColor.value
			});
		} catch (error) {
			console.error("Failed to save theme to store:", error);
		}
	}

	const updateTheme = async () => {
		applyTheme(primaryColor.value, neutralColor.value);
		await saveThemeToStore();
	};

	function randomizeFluidSettings() {
		const newSettings = {
			...fluidSettings.value,
			OPACITY: Math.floor(Math.random() * 100),
			BRIGHTNESS: Math.floor(Math.random() * 200),
			GRAYSCALE: Math.floor(Math.random() * 100),
			SATURATION: Math.floor(Math.random() * 200),
			CONTRAST: Math.floor(Math.random() * 200),
			BLUR: Math.floor(Math.random() * 10)
		};
		updateSettings(newSettings);
	}

	function openSettings() {
		showSettings.value = true;
	}

	function handleSettingsUpdate(newSettings: any) {
		updateSettings(newSettings);
	}

	onMounted(() => {
		loadThemeFromStore();
		initializeFluidCursor();
	});

	watch(fluidSettings, (newSettings) => {
		if (fluidCursor.value) {
			fluidCursor.value.updateSettings(newSettings);
		}
	}, { deep: true });

	// Watch for changes to primaryColor and update the CSS variable
	watch(primaryColor, (newColor) => {
		document.documentElement.style.setProperty("--color-primary", `var(--ui-color-${newColor}-500)`);
		// Also update appConfig to ensure reactivity
		appConfig.ui.colors.primary = newColor;
	});
</script>

<style scoped></style>
