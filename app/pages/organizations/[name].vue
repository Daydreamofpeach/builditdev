<template>
	<div class="organization-page">
		<header class="header">
			<div class="flex items-center gap-4">
				<UButton
					color="primary"
					variant="ghost"
					icon="i-lucide-menu"
					@click="toggleSidebar"
				/>
				<div class="space-y-2">
					<h1>{{ organizationName }}</h1>
					<div class="flex items-center gap-2">
						<UAvatarGroup
							:max="5"
							:ui="{ 
								base: 'flex -space-x-2',
								avatar: { 
									base: 'ring-2 ring-white dark:ring-gray-900',
									size: { sm: 'h-8 w-8' }
								}
							}"
						>
							<UAvatar
								v-for="member in organizationMembers"
								:key="member.username"
								:src="member.avatar || getRandomDogAvatar(member.username)"
								:alt="member.username"
								size="sm"
								:ui="{ 
									base: 'ring-2 ring-white dark:ring-gray-900',
									size: { sm: 'h-8 w-8' }
								}"
							/>
						</UAvatarGroup>
						<span class="text-sm text-gray-500 dark:text-gray-400">
							{{ organizationMembers.length }} members
						</span>
					</div>
				</div>
			</div>
			<UButton @click="open = true" color="primary">
				Add New Component
			</UButton>
		</header>
		<div class="layout">
			<USlideover v-model:open="sidebarOpen" title="Components" :ui="{ footer: 'justify-end' }">
				<template #body>
					<div class="p-4 space-y-4">
						<div v-for="(item, index) in sidebarItems" :key="index" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
							{{ item }}
						</div>
					</div>
				</template>
				<template #footer>
					<UButton
						color="primary"
						variant="outline"
						@click="sidebarOpen = false"
					>
						Close
					</UButton>
				</template>
			</USlideover>
			<main class="main-content">
				<ComponentDisplay
					:components="components"
					@edit="editComponent"
					@delete="deleteComponent"
					@formSubmit="handleFormSubmit"
				/>
			</main>
		</div>

		<!-- Component Store Section -->
		<section class="mt-8 p-6 border-t">
			<h2 class="text-xl font-semibold mb-4">Component Store</h2>
			<div class="space-y-6">
				<JsonataViewer
					:title="`${organizationName} Components`"
					:data="{
						store: `components_${organizationName}`,
						timestamp: new Date().toISOString(),
						data: components.reduce((acc, component) => {
							acc[component.title] = component;
							return acc;
						}, {} as Record<string, Component>)
					}"
					default-tab="json"
				/>
			</div>
		</section>

		<UModal v-if="isDesktop" v-model:open="open" title="Add Component" description="Add a new component to your organization">
			<template #body>
				<ComponentForm
					:editing-index="editingIndex"
					:editing-component="editingComponent"
					@submit="handleSubmit"
					@cancel="open = false"
				/>
			</template>
		</UModal>

		<UDrawer v-else v-model:open="open" title="Add Component" description="Add a new component to your organization">
			<template #body>
				<ComponentForm
					:editing-index="editingIndex"
					:editing-component="editingComponent"
					@submit="handleSubmit"
					@cancel="open = false"
				/>
			</template>
		</UDrawer>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch, onMounted } from "vue";
	import { createReusableTemplate, useMediaQuery } from "@vueuse/core";
	import { useRoute } from "#imports";
	import JsonataViewer from "~/components/JsonataViewer.vue";
	import ComponentForm from "~/components/OrgComponents/ComponentForm.vue";
	import ComponentDisplay from "~/components/OrgComponents/ComponentDisplay.vue";

	const isDesktop = useMediaQuery("(min-width: 768px)");
	const route = useRoute();

	interface Component {
		type: string;
		title: string;
		props: Record<string, any>;
	}

	interface OrganizationMember {
		username: string;
		email: string;
		role: string;
		avatar?: string;
	}

	const organizationName = computed(() => route.params.name as string);
	const sidebarItems = ref(["Layout", "Content", "Settings"]);
	const components = ref<Component[]>([]);
	const open = ref(false);
	const toast = useToast();
	const sidebarOpen = ref(false);
	const editingIndex = ref<number | null>(null);
	const editingComponent = ref<Component | null>(null);
	const organizationMembers = ref<OrganizationMember[]>([]);

	// Component Store Setup
	const store = await useTauriStoreLoad(`components_${organizationName.value}.bin`, {
		autoSave: true
	});

	const getStoreValue = async () => {
		try {
			const storedComponents = await store.get<Component[]>("components") || [];
			components.value = storedComponents;
		} catch (error) {
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	// Function to get a random dog avatar based on username
	const getRandomDogAvatar = (username: string) => {
		// Use the username as a seed for consistent avatar per user
		const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return `https://api.dicebear.com/7.x/shiba/svg?seed=${seed}`;
	};

	// Load organization members
	const loadOrganizationMembers = async () => {
		try {
			const store = await useTauriStoreLoad(`organizations_${organizationName.value}.bin`, {
				autoSave: true
			});
			const org = await store.get<any>("organization");
			if (org?.members) {
				organizationMembers.value = org.members;
			}
		} catch (error) {
			console.error("Error loading organization members:", error);
			toast.add({
				title: "Error",
				description: "Failed to load organization members",
				color: "error"
			});
		}
	};

	// Load components on mount
	onMounted(() => {
		getStoreValue();
		loadOrganizationMembers();
	});

	// Watch for changes in components and update store
	watch(components, async (newComponents) => {
		try {
			await store.set("components", newComponents);
		} catch (error) {
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	}, { deep: true });

	const editComponent = (component: Component) => {
		const index = components.value.findIndex((c) => c.title === component.title);
		if (index !== -1) {
			editingIndex.value = index;
			editingComponent.value = component;
			open.value = true;
		}
	};

	const deleteComponent = (component: Component) => {
		const index = components.value.findIndex((c) => c.title === component.title);
		if (index !== -1) {
			components.value.splice(index, 1);
			toast.add({
				title: "Success",
				description: "Component deleted successfully",
				color: "success"
			});
		}
	};

	const handleSubmit = (newComponent: Component) => {
		if (editingIndex.value !== null) {
			// Update existing component
			components.value[editingIndex.value] = newComponent;
			toast.add({
				title: "Success",
				description: "Component updated successfully",
				color: "success"
			});
		} else {
			// Add new component
			components.value.push(newComponent);
			toast.add({
				title: "Success",
				description: "Component added successfully",
				color: "success"
			});
		}

		// Reset form and close modal
		editingIndex.value = null;
		editingComponent.value = null;
		open.value = false;
	};

	// Reset form when modal is closed
	watch(open, (newValue) => {
		if (!newValue) {
			editingIndex.value = null;
			editingComponent.value = null;
		}
	});

	const toggleSidebar = () => {
		console.log("Toggling sidebar:", !sidebarOpen.value);
		sidebarOpen.value = !sidebarOpen.value;
	};

	// Watch for changes in sidebarOpen
	watch(sidebarOpen, (newValue) => {
		console.log("Sidebar state changed:", newValue);
	});

	const handleFormSubmit = (formData: any) => {
		// Store form submissions in a separate store
		const formStore = useTauriStoreLoad(`forms_${organizationName.value}.bin`, {
			autoSave: true
		});

		// Get existing submissions or initialize empty array
		formStore.get<any[]>("submissions").then((submissions = []) => {
			// Add new submission
			submissions.push({
				...formData,
				id: crypto.randomUUID(),
				organization: organizationName.value
			});

			// Save updated submissions
			formStore.set("submissions", submissions).then(() => {
				toast.add({
					title: "Success",
					description: "Form submitted successfully",
					color: "success"
				});
			}).catch((error) => {
				toast.add({
					title: "Error",
					description: String(error),
					color: "error"
				});
			});
		}).catch((error) => {
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		});
	};
</script>

<style scoped>
	.organization-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid;
	}

	.layout {
		display: flex;
		flex: 1;
	}

	.main-content {
		padding: 1.5rem;
		flex: 1;
	}
</style> 