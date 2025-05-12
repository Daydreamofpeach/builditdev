<template>
	<div>
		<SiteNavbar class="sticky bg-(--ui-bg)/75 backdrop-blur" />
		<SiteSidebar />

		<UContainer>
		
			<div class=" overflow-hidden">
			<DesignTopBlob />
			<DesignBottomBlob />
			<canvas id="fluid" class="fixed inset-0 opacity-90 brightness-50 w-full h-full -z-10" />
			<slot />
		</div>
		</UContainer>
	</div>
</template>
<script lang="ts" setup>
	import useFluidCursor from "~/components/Design/FluidCursor.js";
	import FluidSettings from "~/components/Design/FluidSettings.vue";

	const isFluidEnabled = ref(true);
	const fluidCursor = ref<{ togglePause: () => void } | null>(null);

	onMounted(() => {
		const cursor = useFluidCursor();
		if (cursor) {
			fluidCursor.value = cursor;
		}
	});

	function toggleFluid() {
		isFluidEnabled.value = !isFluidEnabled.value;
		if (fluidCursor.value) {
			fluidCursor.value.togglePause();
		}
	}
</script>