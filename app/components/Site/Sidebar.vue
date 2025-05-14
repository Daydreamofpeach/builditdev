<template>
	<USlideover :open="showSidebar && isLoggedIn" @update:open="showSidebar = false">
		<template #title>
			<NuxtLink to="/">
				<h2 class="text-xl font-bold cursor-pointer">
					Buildit
				</h2>
			</NuxtLink>
		</template>
		<template #description>
			<VisuallyHidden>Description</VisuallyHidden>
		</template>

		<template #body>
			<div class="flex flex-col h-full">
				<!-- Fixed Logo at Top -->
				<div class="flex-none mb-4">
					<NuxtLink to="/">
						<SvgoLogo
							:filled="true"
							:font-controlled="false"
							class="mx-auto z-11 rounded-2xl bg-primary size-20 border-8 border-primary cursor-pointer"
						/>
					</NuxtLink><hr class="mt-8 mb-8 opacity-25">
				</div>

				<!-- Scrollable Content Area -->
				<div class="flex-1 overflow-y-auto">
					<UNavigationMenu
						orientation="vertical"
						:items="items"
					/>
				</div>

				<!-- Fixed Login/Signup at Bottom -->
				<div class="flex-none mt-4">
					<hr class="my-4 opacity-25">
					<div v-if="isLoggedIn" class="space-y-2 px-4 pb-4">
						<UButton block icon="i-lucide-layout-dashboard" variant="ghost" to="/dashboard">
							Dashboard
						</UButton>
						<UButton block icon="i-lucide-log-out" variant="ghost" color="error" @click="signOut">
							Sign Out
						</UButton>
					</div>
					<div v-else class="space-y-2 px-4 pb-4">
						<UButton block icon="i-lucide-log-in" variant="ghost" @click="showLoginSlideover = true">
							Login
						</UButton>
						<UButton block icon="i-lucide-user-plus" variant="ghost" @click="showSignupSlideover = true">
							Sign Up
						</UButton>
					</div>
				</div>
			</div>
		</template>
	</USlideover>

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
</template>

<script lang="ts" setup>
	import LoginSlideover from "~/components/Auth/LoginSlideover.vue";
	import SignupSlideover from "~/components/Auth/SignupSlideover.vue";
	import { useAuthState } from "~/composables/useAuthState";

	const { pages } = usePages();
	const { showSidebar } = useSidebar();
	const showLoginSlideover = ref(false);
	const showSignupSlideover = ref(false);
	const { isLoggedIn, logout } = useAuthState();
	const router = useRouter();

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
							to: `/organizations/${org.name}`,
							icon: "i-lucide-building"
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

	// For debugging - remove after fix is confirmed
	console.log("Filtered pages:", filteredPages);

	const items = ref<any[]>([
		[
			...filteredPages,
			{
				label: "Organizations",
				icon: "i-lucide-building",
				children: organizationPages.value
			}
		]
	]);

	// Watch for changes in organization pages
	watch(organizationPages, (newPages) => {
		items.value = [
			[
				...filteredPages,
				{
					label: "Organizations",
					icon: "i-lucide-building",
					children: newPages
				}
			]
		];
	}, { deep: true });

	function signOut() {
		logout();
		router.push("/");
	}
</script>
