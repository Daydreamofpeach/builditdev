<template>
	<main ref="glowCardWrapper" class="sui-glow-card-wrapper">
		<slot />
	</main>
</template>

<script lang="ts" setup>
	const props = withDefaults(
		defineProps<{
			size?: number
			border?: number
			radius?: number
		}>(),
		{
			size: 200,
			border: 2,
			radius: 10
		}
	);

	const { size, border, radius } = toRefs(props);
	const appConfig = useAppConfig();
	const glowCardWrapper = ref<HTMLElement | null>(null);

	const syncPointer = ({ x, y }: { x: number, y: number }) => {
		if (glowCardWrapper.value) {
			glowCardWrapper.value.style.setProperty("--x", x.toFixed(2));
			glowCardWrapper.value.style.setProperty(
				"--xp",
				(x / window.innerWidth).toFixed(2)
			);

			glowCardWrapper.value.style.setProperty("--y", y.toFixed(2));
			glowCardWrapper.value.style.setProperty(
				"--yp",
				(y / window.innerHeight).toFixed(2)
			);
		}
	};

	const leaveWrapper = () => {
		if (glowCardWrapper.value) {
			glowCardWrapper.value.style.setProperty("--x", "0");
			glowCardWrapper.value.style.setProperty("--y", "0");
		}
	};

	const initialVariables = () => {
		if (glowCardWrapper.value) {
			glowCardWrapper.value.addEventListener("pointermove", syncPointer);
			glowCardWrapper.value.addEventListener("pointerleave", leaveWrapper);
		}
	};

	watch(
		() => appConfig.ui.colors.primary,
		(newColor) => {
			nextTick(() => {
				const hueMap: Record<string, number> = {
					slate: 215,
					gray: 220,
					zinc: 240,
					neutral: 0,
					stone: 25,
					red: 0,
					orange: 30,
					amber: 45,
					yellow: 60,
					lime: 120,
					green: 142,
					emerald: 160,
					teal: 180,
					cyan: 195,
					sky: 200,
					blue: 220,
					indigo: 250,
					violet: 270,
					purple: 280,
					fuchsia: 300,
					pink: 330,
					rose: 350
				};
				glowCardWrapper.value?.style.setProperty("--hue", hueMap[newColor]?.toString() || "210");
			});
		},
		{
			immediate: true
		}
	);

	watch(
		() => size,
		() => {
			nextTick(() => {
				glowCardWrapper.value?.style.setProperty("--size", size.value.toString());
			});
		},
		{
			deep: true,
			immediate: true
		}
	);

	watch(
		() => border,
		() => {
			nextTick(() => {
				glowCardWrapper.value?.style.setProperty("--border", border.value.toString());
			});
		},
		{
			deep: true,
			immediate: true
		}
	);

	watch(
		() => radius,
		() => {
			nextTick(() => {
				glowCardWrapper.value?.style.setProperty("--radius", radius.value.toString());
			});
		},
		{
			deep: true,
			immediate: true
		}
	);

	onMounted(() => {
		initialVariables();
	});
</script>

<style scoped>
.sui-glow-card-wrapper {
	--backdrop: hsla(29, 100%, 48%, 0.021);
	--radius: 12;
	--border: 2;
	--backup-border: var(--backdrop);
	--size: 200;
	--hue: 210;
}
</style>
