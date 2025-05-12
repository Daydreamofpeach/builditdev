<template>
	<UContainer class="relative h-screen flex flex-col justify-between py-0">
		<Head>
			<link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet">
		</Head>
		<!-- Main Content -->
		<div class="flex-1 flex flex-col items-center pt-8 justify-center gap-2">
			<SvgoLogo
				:filled="true"
				:font-controlled="false"
				class="mx-auto animate-pulse z-11 rounded-4xl top-8 infinite bg-primary size-40 border-8 border-primary"
			/>

			<div class="flex flex-col items-center gap-2">
				<div class="flex justify-center z-40 items-center">
					<h1 class="flex">
						<span
							v-for="(letter, index) in 'Welcome'"
							:key="index"
							class="text-4xl sm:text-5xl font-bold themed text-primary transition-all duration-150 cursor-pointer relative font-silkscreen"
							:class="{
								[hoverColors[index] ? `text-${hoverColors[index]}` : '']: hoverColors[index]
							}"
							@mouseenter="handleLetterHover(index)"
							@mouseleave="handleLetterLeave(index)"
							@click="changeTheme(getColor(index))"
						>
							{{ letter }}
						</span>
					</h1>
					
				</div><h4 class="text-lg text-white z-50" > to </h4>
				<div class="w-full flex flex-col items-center justify-center" style="height: 180px; margin-top: 24px; margin-bottom: 24px;">
					<BuilditParticles />
					<BuilditParticles />
				</div><div class="flex flex-wrap justify-center pt-6 gap-3 ">
					<GlowyCardWrapper>
						<GlowyCard>
							<UButton
								variant="outline"
								size="xl"
								@click="showLogin = true"
								
							>
								Login
							</UButton>
						</GlowyCard>
					</GlowyCardWrapper>
					<GlowyCardWrapper>
						<GlowyCard>
							<UButton
								variant="solid"
								size="xl"
								@click="showSignup = true"
								color="primary"
							>
								Sign Up
							</UButton>
						</GlowyCard>
					</GlowyCardWrapper>
				</div>
				<h4 class="text-2xl z-50 text-center -translate-y-40 flex sm-pt-4 pt-10 justify-center items-center themed ">
					Start Building Your Next Project
				</h4>
			</div>
		</div>

		<!-- Footer -->

		<!-- Made by footer -->
		<GlowyCardWrapper>
			<GlowyCard>
				<div class="text-sm text-center -translate-y-4">
					<div class="flex items-center justify-center gap-1 text-(--ui-text-muted)">
						<p class="text-sm">
							Made by
						</p>
						<ULink :to="appConfig.app.repo" external target="_blank">
							{{ appConfig.app.author }}
						</ULink>
					</div>
				</div>
			</GlowyCard>
		</GlowyCardWrapper>

		<LoginSlideover
			v-if="showLogin"
			@close="showLogin = false"
		/>

		<SignupSlideover
			v-if="showSignup"
			@close="showSignup = false"
		/>
	</UContainer>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import LoginSlideover from "@/components/Auth/LoginSlideover.vue";
	import SignupSlideover from "@/components/Auth/SignupSlideover.vue";
	import GlowyCard from "@/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "@/components/stunning/GlowyCardWrapper.vue";
	import BuilditParticles from "@/components/BuilditParticles.vue";


	type ColorOption = "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "slate" | "gray" | "zinc" | "neutral" | "stone";

	const showLogin = ref(false);
	const showSignup = ref(false);

	const appConfig = useAppConfig();

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

	const hoverColors = ref<Record<number, ColorOption>>({});
	const hoverTimeout = ref<Record<number, NodeJS.Timeout>>({});

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

	// Watch for theme changes to ensure letters update
	watch(() => appConfig.ui.colors.primary, () => {
		// Clear any hover states when theme changes
		hoverColors.value = {};
	}, { immediate: true });

	// Clean up timeouts on component unmount
	onUnmounted(() => {
		Object.values(hoverTimeout.value).forEach((timeout) => {
			clearTimeout(timeout);
		});
	});

	const changeTheme = (color: ColorOption) => {
		appConfig.ui.colors.primary = color;
	};

	definePageMeta({
		layout: "home"
	});
</script>

<style>
h1, h2, h3, h4 {
  font-family: 'Silkscreen', cursive;
}
</style>
