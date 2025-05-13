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
								icon="i-lucide-settings"
								color="primary"
								variant="ghost"
								@click="openFluidSettings"
								:ui="{
									label: 'sr-only'
								}"
							/>
							<UButton
								icon="i-lucide-log-in"
								color="primary"
								variant="ghost"
								@click="showLoginSlideover = true"
								:ui="{
									label: 'sr-only'
								}"
							/>
							<UButton
								icon="i-lucide-user-plus"
								color="primary"
								variant="ghost"
								@click="showSignupSlideover = true"
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

		<!-- Fluid Settings Slideover -->
		<FluidSettingsSlideover
			v-if="showFluidSettings"
			:settings="fluidSettings"
			@update:settings="handleSettingsUpdate"
			@close="showFluidSettings = false"
		/>

		<!-- Login Slideover -->
		<LoginSlideover 
			v-if="showLoginSlideover"
			@close="showLoginSlideover = false"
		/>

		<!-- Signup Slideover -->
		<SignupSlideover
			v-if="showSignupSlideover"
			@close="showSignupSlideover = false"
		/>
	</header>
</template>

<script lang="ts" setup>
	import GlowyCard from "~/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "~/components/stunning/GlowyCardWrapper.vue";
	import BackgroundColorPicker from "~/components/BackgroundColorPicker.vue";
	import FluidSettingsSlideover from "~/components/Design/FluidSettingsSlideover.vue";
	import LoginSlideover from "~/components/Auth/LoginSlideover.vue";
	import SignupSlideover from "~/components/Auth/SignupSlideover.vue";
	import { useFluidCursorState } from "~/composables/useFluidCursorState";

	const { pages } = usePages();
	const { showSidebar } = useSidebar();
	const { fluidSettings, updateSettings } = useFluidCursorState();
	const showFluidSettings = ref(false);
	const showLoginSlideover = ref(false);
	const showSignupSlideover = ref(false);

	function openFluidSettings() {
		showFluidSettings.value = true;
	}

	function handleSettingsUpdate(newSettings: any) {
		updateSettings(newSettings);
	}

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
		window.addEventListener('organizations-updated', loadOrganizations);
	});
	onUnmounted(() => {
		window.removeEventListener('organizations-updated', loadOrganizations);
	});

	// Filter out specific pages we don't want to show in navigation
	const filteredPages = pages.filter(page => {
		// Skip auth-callback pages
		if (page.to?.includes('auth-callback')) return false;
		// Skip organization form and dynamic pages
		if (page.to?.includes('organizations/ComponentForm')) return false;
		if (page.to?.includes('organizations-ComponentForm')) return false;
		if (page.to?.includes('organizations-name')) return false;
		if (page.to?.match(/\/organizations\/\[name\]/)) return false;
		
		// Also filter by checking children
		if (page.children && Array.isArray(page.children)) {
			// Filter out unwanted children
			page.children = page.children.filter((child: any) => {
				if (child.to?.includes('auth-callback')) return false;
				if (child.to?.includes('organizations/ComponentForm')) return false;
				if (child.to?.includes('organizations-ComponentForm')) return false;
				if (child.to?.includes('organizations-name')) return false;
				if (child.to?.match(/\/organizations\/\[name\]/)) return false;
				return true;
			});
		}
		
		return true;
	});
	
	// For debugging - remove after fix is confirmed
	console.log("Filtered pages in navbar:", filteredPages);

	const desktopItems = ref<any[]>([
		[
			...filteredPages.map((page) => ({
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
				...filteredPages.map((page) => ({
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
