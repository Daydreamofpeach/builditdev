<template>
	<UModal
		v-model:open="isOpen"
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
				@click="isOpen = false"
			>
				Close
			</UButton>
			<UButton
				color="primary"
				variant="solid"
				icon="i-lucide-edit"
				@click="handleEdit"
			>
				Edit Organization
			</UButton>
		</template>
	</UModal>
</template>

<script setup lang="ts">
	const props = defineProps<{
		organization: {
			name: string;
			description: string;
			members: Array<{
				username: string;
				email: string;
				role: string;
			}>;
			timestamp: number;
		} | null;
	}>();

	const emit = defineEmits<{
		(e: "update:modelValue", value: boolean): void;
		(e: "edit"): void;
	}>();

	const isOpen = ref(false);

	watch(() => props.organization, (newOrg) => {
		isOpen.value = newOrg !== null;
	});

	const getRoleColor = (role: string): "neutral" | "error" | "primary" | "secondary" | "success" | "info" | "warning" => {
		const colors = {
			admin: "error",
			developer: "warning",
			user: "info",
			client: "success",
			guest: "neutral",
			organization: "primary"
		} as const;
		return colors[role as keyof typeof colors] || "neutral";
	};

	const formatDate = (timestamp?: number) => {
		if (!timestamp) return "Unknown";
		return new Date(timestamp).toLocaleString();
	};

	const handleEdit = () => {
		emit("edit");
		isOpen.value = false;
	};
</script>

<style scoped></style> 