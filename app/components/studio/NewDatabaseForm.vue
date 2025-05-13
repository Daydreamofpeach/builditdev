<template>
	<div class="p-4">
		<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
			Create New Database
		</h2>
		<UFormField label="Database Name">
			<UInput v-model="name" placeholder="Enter database name" class="w-full" />
		</UFormField>
		<UFormField label="Database Path">
			<UInput v-model="path" placeholder="Enter database path" class="w-full" />
		</UFormField>
		<div class="flex justify-end gap-2 pt-4">
			<UButton color="neutral" variant="soft" @click="$emit('close')">
				Cancel
			</UButton>
			<UButton color="primary" @click="createDatabase">
				Create Database
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	const emit = defineEmits(["created", "close"]);

	const name = ref("");
	const path = ref("");

	function createDatabase() {
		emit("created", {
			name: name.value,
			path: path.value,
			tables: []
		});
	}
</script>
