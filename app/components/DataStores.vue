<template>
	<LayoutTile
		title="Data Stores"
		description="View and manage all data stores in the application."
	>
		<div class="space-y-6">
			<!-- Data Stores List -->
			<div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
				<UCard
					v-for="store in dataStores"
					:key="store.name"
					:ui="{
						base: 'relative overflow-hidden',
						header: {
							base: 'flex justify-between items-start gap-4',
							background: 'bg-primary dark:bg-primary'
						},
						body: {
							base: 'space-y-4',
							background: 'bg-neutral dark:bg-neutral'
						},
						footer: {
							base: 'flex justify-between items-center',
							background: 'bg-nuetral dark:bg-nuetral'
						}
					}"
				>
					<template #header>
						<div class="flex-1">
							<h3 class="text-lg font-medium text-primary-900 dark:text-primary-100">
								{{ store.name }}
							</h3>
							<p class="text-sm text-primary-600 dark:text-primary-400">
								{{ store.description }}
							</p>
						</div>
						<UButton
							color="primary"
							variant="soft"
							icon="i-lucide-code"
							@click="viewStoreData(store.name)"
						>
							View Data
						</UButton>
					</template>

					<div class="space-y-3">
						<UBadge
							color="primary"
							variant="subtle"
							class="w-full justify-between"
						>
							<span class="text-gray-600 dark:text-gray-400">Last Updated</span>
							<span class="font-medium">{{ formatDate(store.lastUpdated) }}</span>
						</UBadge>

						<UBadge
							color="neutral"
							variant="subtle"
							class="w-full justify-between"
						>
							<span class="text-gray-600 dark:text-gray-400">Entries</span>
							<span class="font-medium">{{ store.entryCount }}</span>
						</UBadge>

						<!-- Organization-specific stores -->
						<template v-if="store.name === 'organizations' && store.organizations">
							<div class="mt-4 space-y-3">
								<div v-for="org in store.organizations" :key="org.name" class="border-t pt-3">
									<h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										{{ org.name }}
									</h4>
									<div class="space-y-2">
										<UBadge
											color="primary"
											variant="subtle"
											class="w-full justify-between"
										>
											<span class="text-gray-600 dark:text-gray-400">Components</span>
											<span class="font-medium">{{ org.componentsCount }}</span>
										</UBadge>
										<UBadge
											color="neutral"
											variant="subtle"
											class="w-full justify-between"
										>
											<span class="text-gray-600 dark:text-gray-400">Forms</span>
											<span class="font-medium">{{ org.formsCount }}</span>
										</UBadge>
									</div>
								</div>
							</div>
						</template>
					</div>

					<template #footer>
						<div class="flex items-center gap-2">
							<UIcon name="i-lucide-database" class="text-primary-500" />
							<span class="text-sm text-gray-600 dark:text-gray-400">
								<ParticleText text="Data Store" />
							</span>
						</div>
						<UBadge
							color="primary"
							variant="soft"
							size="sm"
						>
							Active
						</UBadge>
						<h1>
							{{ store.name }}
						</h1>
					</template>
				</UCard>
			</div>

			<!-- Store Data Viewer -->
			<UCard
				v-if="selectedStore"
				:ui="{
					base: 'relative',
					header: {
						base: 'bg-primary dark:bg-primary'
					},
					body: {
						base: 'bg-white dark:bg-gray-900'
					}
				}"
			>
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-medium text-primary dark:text-primary">
							{{ selectedStore }} Data
						</h3>
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-lucide-x"
							@click="closeViewer"
						>
							Close
						</UButton>
					</div>
				</template>

				<JsonataViewer
					:title="`${selectedStore} Data`"
					:data="storeData"
					:default-tab="activeTab"
					@close="closeViewer"
				/>
			</UCard>
		</div>
	</LayoutTile>
</template>

<script setup lang="ts">
	import { generateStoreData } from "../../utils/jsonataGenerator";

	const toast = useToast();
	const selectedStore = ref<string | null>(null);
	const storeData = ref<any>(null);
	const activeTab = ref("jsonata");

	// Helper function to generate JWT tokens
	const generateJWT = async (payload: any) => {
		try {
			const secret = "your-secret-key"; // In production, use a secure secret key
			const header = {
				alg: "HS256",
				typ: "JWT"
			};

			const encodedHeader = btoa(JSON.stringify(header));
			const encodedPayload = btoa(JSON.stringify(payload));
			const signature = await crypto.subtle.digest(
				"SHA-256",
				new TextEncoder().encode(`${encodedHeader}.${encodedPayload}.${secret}`)
			);
			const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

			return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
		} catch (error) {
			console.error("Error generating JWT:", error);
			return null;
		}
	};

	// List of all data stores in the application
	const dataStores = ref([
		{
			name: "users",
			description: "User management and authentication data",
			lastUpdated: new Date(),
			entryCount: 0
		},
		{
			name: "organizations",
			description: "Organization and team management data",
			lastUpdated: new Date(),
			entryCount: 0,
			organizations: [] as Array<{
				name: string
				componentsCount: number
				formsCount: number
			}>
		},
		{
			name: "projects_index",
			description: "Project management and indexing data",
			lastUpdated: new Date(),
			entryCount: 0
		},
		{
			name: "fluidCursor",
			description: "Fluid cursor settings and configuration",
			lastUpdated: new Date(),
			entryCount: 0
		},
		{
			name: "store",
			description: "General application state and data",
			lastUpdated: new Date(),
			entryCount: 0
		}
	]);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		}).format(date);
	};

	const updateStoreInfo = async (storeName: string) => {
		try {
			const store = await useTauriStoreLoad(`${storeName}.bin`, {
				autoSave: false
			});
			const entries = await store.entries();
			const storeIndex = dataStores.value.findIndex((s) => s.name === storeName);

			if (storeIndex !== -1) {
				dataStores.value[storeIndex].entryCount = entries.length;
				dataStores.value[storeIndex].lastUpdated = new Date();

				// If this is the organizations store, update organization-specific data
				if (storeName === "organizations") {
					const orgs = entries
						.filter(([key]) => key.startsWith("org_"))
						.map(async ([key, value]) => {
							try {
								const orgData = JSON.parse(value as string);
								const orgName = orgData.name;

								// Get components count
								const componentsStore = await useTauriStoreLoad(`components_${orgName}.bin`, {
									autoSave: false
								});
								const components = await componentsStore.entries();

								// Get forms count
								const formsStore = await useTauriStoreLoad(`forms_${orgName}.bin`, {
									autoSave: false
								});
								const forms = await formsStore.entries();

								return {
									name: orgName,
									componentsCount: components.length,
									formsCount: forms.length
								};
							} catch (e) {
								console.error(`Error processing organization ${key}:`, e);
								return null;
							}
						});

					const orgResults = await Promise.all(orgs);
					dataStores.value[storeIndex].organizations = orgResults.filter(Boolean) as Array<{
						name: string
						componentsCount: number
						formsCount: number
					}>;
				}
			}
		} catch (error) {
			console.error(`Error updating store info for ${storeName}:`, error);
		}
	};

	const closeViewer = () => {
		selectedStore.value = null;
		storeData.value = null;
		activeTab.value = "jsonata";
	};

	const viewStoreData = async (storeName: string) => {
		try {
			selectedStore.value = storeName;
			const store = await useTauriStoreLoad(`${storeName}.bin`, {
				autoSave: false
			});
			const entries = await store.entries();
			const baseData = Object.fromEntries(entries);

			// If this is the organizations store, include component and form data
			if (storeName === "organizations") {
				const orgEntries = entries.filter(([key]) => key.startsWith("org_"));

				// Process each organization's data
				const orgData = await Promise.all(
					orgEntries.map(async ([key, value]) => {
						try {
							const orgData = JSON.parse(value as string);
							const orgName = orgData.name;

							// Get components data
							const componentsStore = await useTauriStoreLoad(`components_${orgName}.bin`, {
								autoSave: false
							});
							const components = await componentsStore.entries();
							const componentsData = Object.fromEntries(
								components.map(([k, v]) => {
									try {
										return [k, JSON.parse(v as string)];
									} catch (e) {
										console.error(`Error parsing component data for ${k}:`, e);
										return [k, v];
									}
								})
							);

							// Get forms data
							const formsStore = await useTauriStoreLoad(`forms_${orgName}.bin`, {
								autoSave: false
							});
							const forms = await formsStore.entries();
							const formsData = Object.fromEntries(
								forms.map(([k, v]) => {
									try {
										return [k, JSON.parse(v as string)];
									} catch (e) {
										console.error(`Error parsing form data for ${k}:`, e);
										return [k, v];
									}
								})
							);

							// Generate JWT token for this organization
							const orgToken = await generateJWT({
								org: orgName,
								type: "organization",
								timestamp: Date.now()
							});

							return {
								[key]: {
									...orgData,
									components: componentsData,
									forms: formsData,
									token: await orgToken
								}
							};
						} catch (e) {
							console.error(`Error processing organization ${key}:`, e);
							return null;
						}
					})
				);

				// Combine base data with organization-specific data
				const combinedData = Object.assign({}, ...orgData.filter(Boolean));

				// Create JSONata data structure
				const jsonataData = {
					store: "organizations",
					timestamp: new Date().toISOString(),
					data: combinedData
				};

				// Set the data for both views
				storeData.value = jsonataData;
			} else {
				// For non-organization stores, create a simple JSONata structure
				const jsonataData = {
					store: storeName,
					timestamp: new Date().toISOString(),
					data: baseData
				};

				storeData.value = jsonataData;
			}

			// Force the JSONata tab to be active
			activeTab.value = "jsonata";
		} catch (error) {
			console.error(`Error loading store data for ${storeName}:`, error);
			toast.add({
				title: "Error",
				description: `Failed to load data for ${storeName}`,
				color: "error"
			});
		}
	};

	// Initial load of store information
	onMounted(async () => {
		await Promise.all(dataStores.value.map((store) => updateStoreInfo(store.name)));
	});
</script>

<style scoped></style>
