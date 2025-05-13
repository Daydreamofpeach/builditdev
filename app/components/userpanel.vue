<template>
	<UModal v-model:open="open" title="User Management Panel" :ui="{ footer: 'justify-end' }">
		<template #body>
			<div class="space-y-6">
				<div class="flex justify-between items-center">
					<p class="text-muted mb-4">
						Manage users and their roles. Add, edit, or remove users from the system.
					</p>
					<UButton
						color="neutral"
						variant="ghost"
						icon="i-lucide-code"
						@click="loadJsonataData"
					>
						View JSONata Data
					</UButton>
				</div>

				<UForm :state="inputState" :schema="schema" class="flex flex-col gap-4" @submit="handleSubmit">
					<UFormField label="Username" name="username">
						<UInput v-model="inputState.username" variant="subtle" size="lg" class="w-full" />
					</UFormField>

					<UFormField label="Email" name="email">
						<UInput v-model="inputState.email" variant="subtle" size="lg" class="w-full" />
					</UFormField>

					<UFormField label="Role" name="role">
						<USelect
							v-model="inputState.role"
							:items="[
								{ label: 'Admin', value: 'admin' },
								{ label: 'Developer', value: 'developer' },
								{ label: 'User', value: 'user' },
								{ label: 'Client', value: 'client' },
								{ label: 'Guest', value: 'guest' }
							]"
							variant="subtle"
							size="lg"
							class="w-full"
						/>
					</UFormField>

					<UFormField label="Organizations" name="organizations">
						<MemberSelect
							v-model="inputState.organizations"
							:available-users="availableOrganizations"
							label="Select organizations for this user"
						/>
					</UFormField>
				</UForm>

				<div class="w-full mt-6">
					<UserTable 
						:users="usersList" 
						@delete="removeUser"
						@edit="editUser"
					/>
				</div>

				<JsonataViewer
					v-if="showJsonataData"
					title="Users JSONata Data"
					:data="jsonataData"
				/>
			</div>
		</template>

		<template #footer>
			<UButton color="neutral" variant="outline" @click="open = false">
				Cancel
			</UButton>
			<UButton type="submit" @click="handleSubmit">
				{{ isEditing ? "Update User" : "Add User" }}
			</UButton>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import { h, resolveComponent } from "vue";
	import MemberSelect from "./MemberSelect.vue";
	import JsonataViewer from "./JsonataViewer.vue";
	import { generateStoreData } from "../../utils/jsonataGenerator";

	interface User {
		username: string;
		email: string;
		role: string;
		organizations?: Array<{ name: string }>;
	}

	const open = ref(false);

	const schema = z.object({
		username: z.string({
			required_error: "Username is required"
		}).nonempty(),
		email: z.string({
			required_error: "Email is required"
		}).email(),
		role: z.string({
			required_error: "Role is required"
		}).nonempty(),
		organizations: z.array(z.object({
			name: z.string()
		})).optional().default([])
	});

	type Schema = zInfer<typeof schema>;

	const inputState = ref<Partial<Schema>>({
		username: undefined,
		email: undefined,
		role: undefined,
		organizations: []
	});

	const usersList = ref<User[]>([]);
	const availableOrganizations = ref<Array<{
		username: string;
		email: string;
		role: string;
		name: string;
	}>>([]);

	const isEditing = ref(false);
	const editingUserId = ref<string | null>(null);

	const toast = useToast();
	const store = await useTauriStoreLoad("users.bin", {
		autoSave: true
	});

	const showJsonataData = ref(false);
	const jsonataData = ref<any>(null);

	const emit = defineEmits(['updated']);

	const resetForm = () => {
		inputState.value = {
			username: undefined,
			email: undefined,
			role: undefined,
			organizations: []
		};
		isEditing.value = false;
		editingUserId.value = null;
	};

	const getOrganizations = async () => {
		try {
			const orgStore = await useTauriStoreLoad("organizations.bin", {
				autoSave: true
			});
			const orgs = await orgStore.entries();
			const filteredOrgs = orgs
				.filter(([key]) => key.startsWith("org_"))
				.map(([key, value]) => {
					try {
						const org = JSON.parse(value as string);
						return {
							username: org.name,
							email: org.description || "",
							role: "organization",
							name: org.name
						};
					} catch (e) {
						console.error("Error parsing organization data:", e);
						return null;
					}
				})
				.filter(Boolean) as Array<{
					username: string;
					email: string;
					role: string;
					name: string;
				}>;
			availableOrganizations.value = filteredOrgs;
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
			const users = await store.entries();
			const filteredUsers = users
				.filter(([key]) => key.startsWith("user_"))
				.map(([_, value]) => {
					try {
						const userData = JSON.parse(value as string);
						return {
							...userData,
							organizations: userData.organizations || []
						};
					} catch (e) {
						console.error("Error parsing user data:", e);
						return null;
					}
				})
				.filter(Boolean);
			usersList.value = filteredUsers;
		} catch (error) {
			console.error("Error getting users:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	const handleSubmit = async () => {
		try {
			if (!inputState.value.username || !inputState.value.email || !inputState.value.role) {
				toast.add({
					title: "Error",
					description: "Please fill in all required fields",
					color: "error"
				});
				return;
			}

			const newUser = {
				username: inputState.value.username,
				email: inputState.value.email,
				role: inputState.value.role,
				organizations: inputState.value.organizations?.map(org => ({ name: org.name })) || []
			};

			// Get all users to find the correct user ID
			const users = await store.entries();
			const existingUser = users.find(([_, value]) => {
				try {
					const userData = JSON.parse(value as string);
					return userData.username === newUser.username;
				} catch (e) {
					return false;
				}
			});

			if (isEditing.value && existingUser) {
				// Update existing user
				await store.set(existingUser[0], JSON.stringify(newUser));
				toast.add({
					title: "Success",
					description: "User updated successfully",
					color: "success"
				});
			} else {
				// Add new user
				const userId = `user_${newUser.username}`;
				await store.set(userId, JSON.stringify(newUser));
				toast.add({
					title: "Success",
					description: "User added successfully",
					color: "success"
				});
			}

			// Update organization memberships
			const orgStore = await useTauriStoreLoad("organizations.bin", {
				autoSave: true
			});

			// Get all organizations
			const orgs = await orgStore.entries();
			for (const [orgKey, orgValue] of orgs) {
				if (!orgKey.startsWith("org_")) continue;
				
				try {
					const orgDetails = JSON.parse(orgValue as string);
					if (!orgDetails.members) {
						orgDetails.members = [];
					}

					const orgName = orgKey.replace("org_", "");
					const isMember = newUser.organizations?.some(org => org.name === orgName);
					const existingMemberIndex = orgDetails.members.findIndex((m: any) => m.username === newUser.username);

					if (isMember && existingMemberIndex === -1) {
						// Add user to organization
						orgDetails.members.push({
							username: newUser.username,
							email: newUser.email,
							role: newUser.role
						});
					} else if (!isMember && existingMemberIndex !== -1) {
						// Remove user from organization
						orgDetails.members.splice(existingMemberIndex, 1);
					} else if (isMember && existingMemberIndex !== -1) {
						// Update user's role in organization
						orgDetails.members[existingMemberIndex] = {
							username: newUser.username,
							email: newUser.email,
							role: newUser.role
						};
					}

					await orgStore.set(orgKey, JSON.stringify(orgDetails));
				} catch (e) {
					console.error("Error updating organization:", e);
				}
			}

			await Promise.all([getUsers(), getOrganizations()]);
			emit('updated');
			resetForm();
		} catch (error) {
			console.error("Error handling user:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	const editUser = (user: User) => {
		inputState.value = {
			username: user.username,
			email: user.email,
			role: user.role,
			organizations: user.organizations || []
		};
		isEditing.value = true;
		editingUserId.value = `user_${user.username}`;
	};

	const removeUser = async (user: User) => {
		try {
			const users = await store.entries();
			const userEntry = users.find(([_, value]) => {
				try {
					const userData = JSON.parse(value as string);
					return userData.username === user.username;
				} catch (e) {
					console.error("Error parsing user data during removal:", e);
					return false;
				}
			});

			if (userEntry) {
				await store.delete(userEntry[0]);
				await getUsers();
				toast.add({
					title: "Success",
					description: "User removed successfully",
					color: "success"
				});
			} else {
				toast.add({
					title: "Error",
					description: "User not found",
					color: "error"
				});
			}
		} catch (error) {
			console.error("Error removing user:", error);
			toast.add({
				title: "Error",
				description: String(error),
				color: "error"
			});
		}
	};

	const loadJsonataData = async () => {
		try {
			jsonataData.value = await generateStoreData("users");
			showJsonataData.value = true;
		} catch (error) {
			console.error("Error loading store data:", error);
			toast.add({
				title: "Error",
				description: "Failed to load store data",
				color: "error"
			});
		}
	};

	// Initial load
	onMounted(async () => {
		await Promise.all([getUsers(), getOrganizations()]);
	});

	// Expose the open ref to parent components
	defineExpose({
		open,
		resetForm
	});
</script>

<style scoped></style>
