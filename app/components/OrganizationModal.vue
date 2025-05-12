<template>
	<UModal
		v-model:open="viewModalOpen"
		:title="organization?.name"
		:ui="{ footer: 'justify-end' }"
	>
		<template #body>
			<div class="space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-4">
						<div>
							<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
							<p class="mt-1">{{ organization?.description }}</p>
						</div>
						<div>
							<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h4>
							<p class="mt-1">{{ formatDate(organization?.timestamp) }}</p>
						</div>
					</div>
					<div>
						<h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Members</h4>
						<div class="space-y-2">
							<div
								v-for="member in organization?.members"
								:key="member.username"
								class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
							>
								<div class="flex items-center gap-2">
									<UIcon name="i-lucide-user" class="text-gray-500" />
									<div>
										<div class="font-medium">{{ member.username }}</div>
										<div class="text-sm text-gray-500">{{ member.email }}</div>
									</div>
									<UBadge :color="getRoleColor(member.role)" variant="subtle" class="ml-2">
										{{ member.role }}
									</UBadge>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template #footer>
			<UButton
				color="neutral"
				variant="outline"
				@click="viewModalOpen = false"
			>
				Close
			</UButton>
			<UButton
				color="primary"
				variant="solid"
				icon="i-lucide-edit"
				@click="editModalOpen = true"
			>
				Edit Organization
			</UButton>

			<UModal
				v-model:open="editModalOpen"
				title="Edit Organization"
				:ui="{ footer: 'justify-end' }"
			>
				<template #body>
					<UForm :state="editState" :schema="schema" class="space-y-4">
						<UFormField label="Organization Name" name="name">
							<UInput v-model="editState.name" variant="subtle" size="lg" class="w-full" />
						</UFormField>

						<UFormField label="Description" name="description">
							<UTextarea v-model="editState.description" variant="subtle" size="lg" class="w-full" />
						</UFormField>

						<UFormField label="Members" name="members">
							<MemberSelect
								v-model="editState.members"
								:available-users="availableUsers"
								label="Select organization members"
							/>
						</UFormField>
					</UForm>
				</template>

				<template #footer>
					<UButton
						color="neutral"
						variant="outline"
						@click="editModalOpen = false"
					>
						Cancel
					</UButton>
					<UButton
						color="primary"
						variant="solid"
						@click="handleSave"
					>
						Save Changes
					</UButton>
				</template>
			</UModal>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	import MemberSelect from "./MemberSelect.vue"

	const props = defineProps<{
		organization: {
			name: string
			description: string
			members: Array<{
				username: string
				email: string
				role: string
			}>
			timestamp: number
		} | null
		availableUsers: Array<{
			username: string
			email: string
			role: string
		}>
	}>()

	const emit = defineEmits<{
		(e: "update:modelValue", value: boolean): void
		(e: "save", organization: typeof props.organization): void
	}>()

	const viewModalOpen = ref(false)
	const editModalOpen = ref(false)

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
	})

	type Schema = zInfer<typeof schema>

	const editState = ref<Partial<Schema>>({
		name: undefined,
		description: undefined,
		members: []
	})

	watch(() => props.organization, (newOrg) => {
		if (newOrg) {
			viewModalOpen.value = true
			editState.value = {
				name: newOrg.name,
				description: newOrg.description,
				members: newOrg.members
			}
		} else {
			viewModalOpen.value = false
			editModalOpen.value = false
		}
	})

	const getRoleColor = (role: string): "neutral" | "error" | "primary" | "secondary" | "success" | "info" | "warning" => {
		const colors = {
			admin: "error",
			developer: "warning",
			user: "info",
			client: "success",
			guest: "neutral",
			organization: "primary"
		} as const
		return colors[role as keyof typeof colors] || "neutral"
	}

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Unknown"
		return new Date(timestamp).toLocaleString()
	}

	const handleSave = () => {
		if (!props.organization) return

		const updatedOrg = {
			...props.organization,
			name: editState.value.name || props.organization.name,
			description: editState.value.description || props.organization.description,
			members: editState.value.members || props.organization.members
		}

		emit("save", updatedOrg)
		editModalOpen.value = false
	}
</script>

<style scoped></style> 