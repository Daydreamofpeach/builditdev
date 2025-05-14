<template>
	<header class="top-0 z-50">
		<GlowyCardWrapper>
			<GlowyCard>
				<UContainer class="lg:py-2 py-1">
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
						<div class="flex-none flex items-center gap-2 sm:gap-4">
							<ColorPicker />
							<BackgroundColorPicker />
							<UButton
								icon="i-lucide-settings"
								color="primary"
								variant="ghost"
								:ui="{
									label: 'sr-only'
								}"
								@click="openFluidSettings"
							/>
							<div v-if="isLoggedIn" class="flex gap-2">
								<UButton icon="i-lucide-layout-dashboard" color="primary" variant="ghost" to="/dashboard">
									<span class="hidden sm:inline">Dashboard</span>
								</UButton>
								<UButton icon="i-lucide-log-out" color="error" variant="ghost" @click="signOut">
									<span class="sr-only">Sign Out</span>
								</UButton>
							</div>
							<div v-else class="flex gap-2">
								<UButton icon="i-lucide-log-in" color="primary" variant="ghost" @click="showLoginSlideover = true">
									Login
								</UButton>
								<UButton icon="i-lucide-user-plus" color="primary" variant="ghost" @click="showSignupSlideover = true">
									Sign Up
								</UButton>
							</div>
							<UButton
								v-if="isLoggedIn"
								icon="i-lucide-menu"
								color="primary"
								variant="ghost"
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
	import LoginSlideover from "~/components/Auth/LoginSlideover.vue";
	import SignupSlideover from "~/components/Auth/SignupSlideover.vue";
	import BackgroundColorPicker from "~/components/BackgroundColorPicker.vue";
	import FluidSettingsSlideover from "~/components/Design/FluidSettingsSlideover.vue";
	import GlowyCard from "~/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "~/components/stunning/GlowyCardWrapper.vue";
	import { useAuthState } from "~/composables/useAuthState";
	import { useFluidCursorState } from "~/composables/useFluidCursorState";

	const { pages } = usePages();
	const { showSidebar } = useSidebar();
	const { fluidSettings, updateSettings } = useFluidCursorState();
	const showFluidSettings = ref(false);
	const showLoginSlideover = ref(false);
	const showSignupSlideover = ref(false);
	const { isLoggedIn, logout } = useAuthState();
	const router = useRouter();

	function openFluidSettings() {
		showFluidSettings.value = true;
	}

	function handleSettingsUpdate(newSettings: any) {
		updateSettings(newSettings);
	}

	function signOut() {
		logout();
		router.push("/");
	}

	// Filter out specific pages we don't want to show in navigation
	const filteredPages = pages.filter((page) => {
		// Skip auth-callback pages
		if (page.to?.includes("auth-callback")) return false;
		// Skip organization form and dynamic pages
		if (page.to?.includes("organizations/ComponentForm")) return false;
		if (page.to?.includes("organizations-ComponentForm")) return false;
		if (page.to?.includes("organizations-name")) return false;
		if (page.to?.match(/\/organizations\/\[name\]/)) return false;
		// Skip dashboard page
		if (page.to === "/dashboard") return false;

		// Also filter by checking children
		if (page.children && Array.isArray(page.children)) {
			// Filter out unwanted children
			page.children = page.children.filter((child: any) => {
				if (child.to?.includes("auth-callback")) return false;
				if (child.to?.includes("organizations/ComponentForm")) return false;
				if (child.to?.includes("organizations-ComponentForm")) return false;
				if (child.to?.includes("organizations-name")) return false;
				if (child.to?.match(/\/organizations\/\[name\]/)) return false;
				// Skip dashboard child
				if (child.to === "/dashboard") return false;
				return true;
			});
		}

		return true;
	});

	const desktopItems = ref<any[]>([
		[
			...filteredPages.map((page) => ({
				...page,
				ui: {
					label: "sr-only"
				}
			}))
		]
	]);
</script>
