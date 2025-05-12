<template>
	<div class="space-y-6">
		<div class="flex justify-between items-center">
			<h2 class="text-xl font-semibold">Organizations</h2>
			<div class="flex gap-2">
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-code"
					@click="loadJsonataData"
				>
					View JSONata Data
				</UButton>
				<UButton
					color="neutral"
					variant="ghost"
					icon="i-lucide-file-json"
					@click="loadJsonData"
				>
					View JSON Data
				</UButton>
			</div>
		</div>

		<UForm :state="inputState" :schema="schema" class="flex flex-col gap-y-4 items-end" @submit="handleSubmit">
			<UFormField label="Organization Name" name="name">
				<UInput v-model="inputState.name" variant="subtle" size="lg" class="w-full" />
			</UFormField>

			<UFormField label="Description" name="description">
				<UTextarea v-model="inputState.description" variant="subtle" size="lg" class="w-full" />
			</UFormField>

			<UFormField label="Members" name="members">
				<MemberSelect
					v-model="selectedMembers"
					:available-users="availableUsers"
					label="Select organization members"
				/>
			</UFormField>

			<UButton type="submit" size="lg" class="self-end">
				{{ isEditing ? "Update Organization" : "Add Organization" }}
			</UButton>
		</UForm>

		<div class="w-full">
			<UTable
				v-model:expanded="expanded"
				:data="organizationsList"
				:columns="columns"
				:ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
				class="flex-1"
			>
				<template #expanded="{ row }">
					<pre>{{ row.original }}</pre>
				</template>
			</UTable>

			<OrganizationModal
				v-if="selectedOrganization"
				v-model:modelValue="showDetailsModal"
				:organization="selectedOrganization"
				:available-users="availableUsers"
				@save="handleSave"
			/>
		</div>

		<JsonataViewer
			v-if="showJsonataData"
			title="Organizations Data"
			:data="jsonataData"
			:default-tab="jsonataViewerTab"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { ChipProps, TableColumn } from "@nuxt/ui";
	import { h, resolveComponent } from "vue";
	import MemberSelect from "./MemberSelect.vue";
	import { generateStoreData } from "../../utils/jsonataGenerator";
	import JsonataViewer from "./JsonataViewer.vue";
	import OrganizationDetails from "./OrganizationDetails.vue";
	import OrganizationModal from "./OrganizationModal.vue";

	const schema = z.object({
		name: z.string({
			required_error: "Organization name is required"
		}).nonempty(),
		description: z.string({
			required_error: "Description is required"
		}).nonempty(),
		members: z.array(z.object({
			username: z.string(),
			email: z.string(),
			role: z.string()
		})).optional()
	});

	type Schema = zInfer<typeof schema>;

	const inputState = ref<Partial<Schema>>({
		name: undefined,
		description: undefined,
		members: []
	});

	const selectedMembers = ref<Array<{
		username: string;
		email: string;
		role: string;
	}>>([]);

	const organizationsList = ref<Array<{
		name: string
		description: string
		members: Array<{ username: string, email: string, role: string }>
	}>>([]);

	const availableUsers = ref<Array<{
		username: string;
		email: string;
		role: string;
	}>>([]);

	const isEditing = ref(false);
	const editingOrgId = ref<string | null>(null);
	const expanded = ref({});
	const showJsonataData = ref(false);
	const jsonataData = ref<any>(null);
	const showDetailsModal = ref(false);
	const selectedOrganization = ref<{
		name: string;
		description: string;
		members: Array<{
			username: string;
			email: string;
			role: string;
		}>;
		timestamp: number;
	} | null>(null);

	const toast = useToast();
	const store = await useTauriStoreLoad("organizations.bin", {
		autoSave: true
	});

	const getRoleColor = (role: string): "neutral" | "error" | "primary" | "secondary" | "success" | "info" | "warning" => {
		const colors = {
			admin: "error",
			developer: "warning",
			user: "info",
			client: "success",
			guest: "neutral"
		} as const;
		return colors[role as keyof typeof colors] || "neutral";
	};

	const getOrganizations = async () => {
		try {
			const orgs = await store.entries();
			const filteredOrgs = orgs
				.filter(([key]) => key.startsWith("org_"))
				.map(([_, value]) => {
					try {
						return JSON.parse(value as string);
					} catch (e) {
						console.error("Error parsing organization data:", e);
						return null;
					}
				})
				.filter(Boolean);
			organizationsList.value = filteredOrgs;
		} catch (error) {
			console.error("Error getting organizations:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	const getUsers = async () => {
		try {
			const userStore = await useTauriStoreLoad("users.bin", {
				autoSave: true
			})
			const users = await userStore.entries()
			console.log("Raw users from store:", users) // Debug log
			
			const filteredUsers = users
				.filter(([key]) => key.startsWith("user_"))
				.map(([_, value]) => {
					try {
						const user = JSON.parse(value as string)
						console.log("Parsed user:", user) // Debug log
						return {
							username: user.username,
							email: user.email,
							role: user.role
						}
					} catch (e) {
						console.error("Error parsing user data:", e)
						return null
					}
				})
				.filter(Boolean) as Array<{
					username: string
					email: string
					role: string
				}>
			
			console.log("Filtered users:", filteredUsers) // Debug log
			availableUsers.value = filteredUsers
		} catch (error) {
			console.error("Error getting users:", error)
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			})
		}
	}

	const handleSubmit = async () => {
		if (isEditing.value && editingOrgId.value) {
			await updateOrganization();
		} else {
			await addOrganization();
		}
	};

	const addOrganization = async () => {
		try {
			if (!inputState.value.name || !inputState.value.description) {
				toast.add({
					title: "Error",
					description: "Please fill in all required fields",
					color: "error"
				});
				return;
			}

			const newOrg = {
				name: inputState.value.name,
				description: inputState.value.description,
				members: inputState.value.members || []
			};
			const orgId = `org_${Date.now()}`;
			await store.set(orgId, JSON.stringify(newOrg));

			// Update user records to include this organization
			const userStore = await useTauriStoreLoad("users.bin", {
				autoSave: true
			});
			for (const member of newOrg.members) {
				const userKey = `user_${member.username}`;
				const userData = await userStore.get(userKey);
				if (userData) {
					const user = JSON.parse(userData as string);
					if (!user.organizations) {
						user.organizations = [];
					}
					if (!user.organizations.some((org: { name: string }) => org.name === newOrg.name)) {
						user.organizations.push({ name: newOrg.name });
						await userStore.set(userKey, JSON.stringify(user));
					}
				}
			}

			await getOrganizations();
			toast.add({
				title: "Success",
				description: "Organization added successfully",
				color: "success"
			});
		} catch (error) {
			console.error("Error adding organization:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		} finally {
			resetForm();
		}
	};

	const updateOrganization = async () => {
		try {
			if (!editingOrgId.value) return;

			if (!inputState.value.name || !inputState.value.description) {
				toast.add({
					title: "Error",
					description: "Please fill in all required fields",
					color: "error"
				});
				return;
			}

			const updatedOrg = {
				name: inputState.value.name,
				description: inputState.value.description,
				members: inputState.value.members || []
			};

			// Get the old organization data to track member changes
			const oldOrgData = await store.get(editingOrgId.value);
			const oldOrg = oldOrgData ? JSON.parse(oldOrgData as string) : { members: [] };

			await store.set(editingOrgId.value, JSON.stringify(updatedOrg));

			// Update user records to reflect organization changes
			const userStore = await useTauriStoreLoad("users.bin", {
				autoSave: true
			});

			// Remove organization from users who are no longer members
			for (const oldMember of oldOrg.members) {
				if (!updatedOrg.members.some(m => m.username === oldMember.username)) {
					const userKey = `user_${oldMember.username}`;
					const userData = await userStore.get(userKey);
					if (userData) {
						const user = JSON.parse(userData as string);
						if (user.organizations) {
							user.organizations = user.organizations.filter(
								(org: { name: string }) => org.name !== updatedOrg.name
							);
							await userStore.set(userKey, JSON.stringify(user));
						}
					}
				}
			}

			// Add organization to new members
			for (const member of updatedOrg.members) {
				const userKey = `user_${member.username}`;
				const userData = await userStore.get(userKey);
				if (userData) {
					const user = JSON.parse(userData as string);
					if (!user.organizations) {
						user.organizations = [];
					}
					if (!user.organizations.some((org: { name: string }) => org.name === updatedOrg.name)) {
						user.organizations.push({ name: updatedOrg.name });
						await userStore.set(userKey, JSON.stringify(user));
					}
				}
			}

			await getOrganizations();
			toast.add({
				title: "Success",
				description: "Organization updated successfully",
				color: "success"
			});
		} catch (error) {
			console.error("Error updating organization:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		} finally {
			resetForm();
		}
	};

	const editOrganization = (org: typeof organizationsList.value[0]) => {
		selectedOrganization.value = {
			...org,
			timestamp: Date.now()
		};
		showDetailsModal.value = true;
	};

	const removeOrganization = async (org: { name: string, description: string, members: Array<{ username: string, email: string, role: string }> }) => {
		try {
			const orgs = await store.entries();
			const orgEntry = orgs.find(([_, value]) => {
				try {
					const orgData = JSON.parse(value as string);
					return orgData.name === org.name;
				} catch (e) {
					console.error("Error parsing org data during removal:", e);
					return false;
				}
			});

			if (orgEntry) {
				await store.delete(orgEntry[0]);
				await getOrganizations();
				toast.add({
					title: "Success",
					description: "Organization removed successfully",
					color: "success"
				});
			} else {
				toast.add({
					title: "Error",
					description: "Organization not found",
					color: "error"
				});
			}
		} catch (error) {
			console.error("Error removing organization:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	const resetForm = () => {
		inputState.value = {
			name: undefined,
			description: undefined,
			members: []
		};
		selectedMembers.value = [];
		isEditing.value = false;
		editingOrgId.value = null;
	};

	const columns: TableColumn<typeof organizationsList.value[0]>[] = [
		{
			id: "expand",
			cell: ({ row }) =>
				h(resolveComponent("UButton"), {
					color: "neutral",
					variant: "ghost",
					icon: "i-lucide-chevron-down",
					square: true,
					"aria-label": "Expand",
					ui: {
						leadingIcon: [
							"transition-transform",
							row.getIsExpanded() ? "duration-200 rotate-180" : ""
						]
					},
					onClick: () => row.toggleExpanded()
				})
		},
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => h(resolveComponent("UButton"), {
				color: "primary",
				variant: "link",
				to: `/organizations/${row.getValue("name")}`,
				onClick: () => {
					selectedOrganization.value = {
						...row.original,
						timestamp: Date.now()
					};
				}
			}, () => row.getValue("name"))
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => row.getValue("description")
		},
		{
			accessorKey: "members",
			header: "Members",
			cell: ({ row }) => {
				const members = row.getValue("members") as Array<{ username: string }>;
				return h("div", { class: "flex flex-wrap gap-1" }, members.map((member) =>
					h(resolveComponent("UBadge"), {
						variant: "subtle",
						color: "primary"
					}, () => member.username)
				));
			}
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const org = row.original;
				return h("div", { class: "flex gap-2" }, [
					h(resolveComponent("UButton"), {
						color: "primary",
						variant: "soft",
						icon: "i-lucide-edit",
						size: "sm",
						onClick: () => editOrganization(org)
					}),
					h(resolveComponent("UButton"), {
						color: "red",
						variant: "soft",
						icon: "i-lucide-trash",
						size: "sm",
						onClick: () => removeOrganization(org)
					})
				]);
			}
		}
	];

	const loadJsonataData = async () => {
		try {
			jsonataData.value = await generateJsonataData("organizations");
			showJsonataData.value = true;
		} catch (error) {
			console.error("Error loading JSONata data:", error);
			toast.add({
				title: "Error",
				description: "Failed to load JSONata data",
				color: "error"
			});
		}
	};

	const loadJsonData = async () => {
		try {
			jsonataData.value = await generateStoreData("organizations");
			showJsonataData.value = true;
			jsonataViewerTab.value = "json";
		} catch (error) {
			console.error("Error loading JSON data:", error);
			toast.add({
				title: "Error",
				description: "Failed to load JSON data",
				color: "error"
			});
		}
	};

	const jsonataViewerTab = ref("json");

	const handleSave = async (updatedOrg: typeof selectedOrganization.value) => {
		if (!updatedOrg) return;

		try {
			await editOrganization(updatedOrg);
			showDetailsModal.value = false;
			selectedOrganization.value = null;
			await getOrganizations(); // Refresh the organizations list
		} catch (error) {
			console.error("Error updating organization:", error);
			toast.add({
				title: "Error",
				description: "Failed to update organization",
				color: "error"
			});
		}
	};

	// Initial load
	onMounted(async () => {
		await Promise.all([getOrganizations(), getUsers()]);
	});

	// Watch for changes in selected members
	watch(
		selectedMembers,
		(newValue) => {
			inputState.value.members = newValue;
		},
		{ immediate: true }
	);
</script>

<style scoped></style> 