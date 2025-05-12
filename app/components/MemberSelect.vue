<template>
	<div class="space-y-4">
		<label class="text-sm font-medium text-gray-700">
			{{ label }}
		</label>
		<div class="space-y-2">
			<div v-for="item in availableUsers" :key="item.username" class="flex items-center justify-between p-2">
				<div class="flex items-center gap-2">
					<UIcon name="i-lucide-user" class="text-gray-500" />
					<div>
						<div class="font-medium">{{ item.username }}</div>
						<div class="text-sm text-gray-500">{{ item.email }}</div>
					</div>
					<UBadge :color="getRoleColor(item.role)" variant="subtle" class="ml-2">
						{{ item.role }}
					</UBadge>
				</div>
				<USwitch
					:model-value="isSelected(item)"
					@update:model-value="(value) => toggleItem(item, value)"
				/>
			</div>
		</div>
		<p v-if="error" class="text-sm text-red-500">
			{{ error }}
		</p>
	</div>
</template>

<script setup lang="ts">
	interface Member {
		username: string
		email: string
		role: string
	}

	interface Organization {
		name: string
		description: string
	}

	const props = defineProps<{
		label?: string
		error?: string
		modelValue: Array<{
			username: string
			email: string
			role: string
		}>
		availableUsers: Array<{
			username: string
			email: string
			role: string
		}>
	}>()

	const emit = defineEmits<{
		(e: "update:modelValue", value: Array<{
			username: string
			email: string
			role: string
		}>): void
	}>()

	const isSelected = (item: { username: string }) => {
		return props.modelValue.some((m) => m.username === item.username)
	}

	const toggleItem = (item: { username: string; email: string; role: string }, selected: boolean) => {
		const newValue = selected
			? [...props.modelValue, item]
			: props.modelValue.filter((m) => m.username !== item.username)
		emit("update:modelValue", newValue)
	}

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
</script>

<style scoped></style> 