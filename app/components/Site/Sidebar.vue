<template>
	<USlideover :open="showSidebar" @update:open="showSidebar = false">
		<template #title>
			<LogoWithTitle />
		</template>
		<template #description>
			<VisuallyHidden>Description</VisuallyHidden>
		</template>

		<template #body>	<SvgoLogo
				:filled="true"
				:font-controlled="false"
				class="mx-auto  z-11 rounded-4xl top-4 bg-primary size-20 border-8 border-primary"
			/>
			<div class="flex flex-col h-full">
				<UNavigationMenu
					orientation="vertical"
					:items="items"
				/>
				<div class="mt-auto">
					<UDivider class="my-4" />
					<div class="space-y-2 px-4 pb-10">
						<UButton
							block
							to="/login"
							icon="i-lucide-log-in"
							variant="ghost"
						>
							Login
						</UButton>
						<UButton
							block
							to="/signup"
							icon="i-lucide-user-plus"
							variant="ghost"
						>
							Sign Up
						</UButton>
					</div>
				</div>
			</div>
		</template>
	</USlideover>
</template>

<script lang="ts" setup>


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

	const items = ref<any[]>([
		[
			...pages,
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
				...pages,
				{
					label: "Organizations",
					icon: "i-lucide-building",
					children: newPages
				}
			]
		];
	}, { deep: true });
</script>
