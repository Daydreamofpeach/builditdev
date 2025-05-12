<template>
	<header class="top-0 z-50">
		<GlowyCardWrapper>
			<GlowyCard>
				<UContainer class="lg:py-2">
					<div class="flex justify-between items-center gap-4">
						<div class="flex-none">
							<NuxtLink to="/">
								<UAvatar
									icon="local:logo"
									size="xl"
									color="primary"
									:ui="{
										root: 'group',
										icon: 'opacity-100 group-hover:opacity-100 transition-opacity duration-300'
									}"
								/>
							</NuxtLink>
						</div>
						<div class="flex-1 flex justify-center">
							<UNavigationMenu
								:items="desktopItems"
								variant="pill"
								color="primary"
								:ui="{
									root: 'hidden lg:flex',
									viewportWrapper: 'max-w-2xl',
									list: 'lg:gap-x-2'
								}"
							/>
						</div>
						<div class="flex-none flex items-center gap-0">
							<ColorPicker />
							<BackgroundColorPicker />
							<UButton
								icon="i-lucide-log-in"
								to="/login"
								color="primary"
								variant="ghost"
								:ui="{
									label: 'sr-only'
								}"
							/>
							<UButton
								icon="i-lucide-user-plus"
								to="/signup"
								color="primary"
								variant="ghost"
								:ui="{
									label: 'sr-only'
								}"
							/>
							<UButton
								icon="i-lucide-menu"
								color="primary"
								variant="ghost"
								class="lg:hidden"
								@click="showSidebar = true"
							/>
						</div>
					</div>
				</UContainer>
			</GlowyCard>
		</GlowyCardWrapper>
	</header>
</template>

<script lang="ts" setup>
	import GlowyCard from "~/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "~/components/stunning/GlowyCardWrapper.vue";
	import BackgroundColorPicker from "~/components/BackgroundColorPicker.vue";

	const { pages } = usePages();
	const { showSidebar } = useSidebar();

	// Get organizations for navigation
	const store = await useTauriStoreLoad("organizations.bin", {
		autoSave: true
	});

	const organizationPages = ref<any[]>([]);

	const loadOrganizations = async () => {
		try {
			const orgs = await store.entries();
			const filteredOrgs = orgs
				.filter(([key]) => key.startsWith("org_"))
				.map(([_, value]) => {
					try {
						const org = JSON.parse(value as string);
						return {
							label: org.name,
							icon: "i-lucide-building",
							to: `/organizations/${org.name}`
						};
					} catch (e) {
						console.error("Error parsing organization data:", e);
						return null;
					}
				})
				.filter(Boolean);
			organizationPages.value = filteredOrgs;
		} catch (error) {
			console.error("Error loading organizations:", error);
		}
	};

	// Load organizations on mount
	onMounted(() => {
		loadOrganizations();
	});

	const desktopItems = ref<any[]>([
		[
			...pages.map((page) => ({
				...page,
				ui: {
					label: "sr-only"
				}
			})),
			{
				icon: "i-lucide-building",
				children: organizationPages.value,
				ui: {
					label: "sr-only"
				}
			}
		]
	]);

	// Watch for changes in organization pages
	watch(organizationPages, (newPages) => {
		desktopItems.value = [
			[
				...pages.map((page) => ({
					...page,
					ui: {
						label: "sr-only"
					}
				})),
				{
					icon: "i-lucide-building",
					children: newPages,
					ui: {
						label: "sr-only"
					}
				}
			]
		];
	}, { deep: true });
</script>
