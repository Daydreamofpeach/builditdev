<template>
	<div v-if="isOpen" class="h-full flex">
		<div class="w-72 bg-neutral-900 text-neutral-100 border-r border-neutral-800 h-full flex flex-col p-4 relative">
			<!-- Close Button -->
			<UButton
				icon="i-lucide-chevron-left"
				color="neutral"
				variant="subtle"
				class="absolute top-2 right-2"
				aria-label="Close sidebar"
				@click="$emit('toggle')"
			/>
			<!-- New Database Inline Form -->
			<form class="mb-4 flex flex-col gap-2" @submit.prevent="createDatabase">
				<UFormField label="Name" required>
					<UInput v-model="newDb.name" placeholder="Database name" />
				</UFormField>
				<UFormField label="Path" required>
					<UInput v-model="newDb.path" placeholder="Path (e.g. ./mydb.sqlite)" />
				</UFormField>
				<UButton type="submit" color="primary" :loading="isCreatingDb" size="sm">
					Create
				</UButton>
			</form>

			<!-- Database List -->
			<div class="flex-1 overflow-y-auto">
				<div v-if="props.databases.length === 0" class="text-center py-4">
					<p class="text-sm text-neutral-400">
						No databases found
					</p>
				</div>
				<div v-else class="space-y-1">
					<div v-for="db in props.databases" :key="db.path" class="flex items-center group">
						<UButton
							color="neutral"
							variant="ghost"
							class="w-full justify-start flex-1"
							:class="{ 'bg-primary-900': props.selectedDatabase && props.selectedDatabase.path === db.path }"
							@click="$emit('selectTable', db)"
						>
							<template #leading>
								<UIcon name="i-lucide-database" class="text-neutral-500" />
							</template>
							{{ db.name }}
						</UButton>
						<UButton
							icon="i-lucide-trash"
							color="error"
							variant="ghost"
							size="xs"
							class="ml-1 opacity-0 group-hover:opacity-100 transition"
							@click="confirmDelete(db)"
						/>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="pt-4 border-t border-neutral-800">
				<UButton
					color="neutral"
					variant="ghost"
					class="w-full justify-start"
					@click="$emit('refresh')"
				>
					<template #leading>
						<UIcon name="i-lucide-refresh-ccw" class="text-neutral-500" />
					</template>
					Refresh
				</UButton>
			</div>
		</div>
		<div class="flex-1" @click="$emit('toggle')" />
	</div>
</template>

<script setup lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { remove } from "@tauri-apps/plugin-fs";
	import { onMounted, ref } from "vue";

	interface DatabaseInfo {
		name: string
		path: string
		tables: any[]
	}

	const props = defineProps<{
		databases: DatabaseInfo[]
		selectedDatabase: DatabaseInfo | null
		isOpen: boolean
	}>();

	const emit = defineEmits<{
		selectTable: [db: DatabaseInfo]
		refresh: []
		update: [payload: { databases: DatabaseInfo[], selectedDatabase: DatabaseInfo | null }]
		toggle: []
	}>();

	const newDb = ref({ name: "", path: "" });
	const isCreatingDb = ref(false);

	async function createDatabase() {
		if (!newDb.value.name || !newDb.value.path) return;
		isCreatingDb.value = true;
		try {
			await invoke("plugin:sqlite|create_database", { path: newDb.value.path });
			const updated = [...props.databases, { name: newDb.value.name, path: newDb.value.path, tables: [] }];
			emit("update", { databases: updated, selectedDatabase: props.selectedDatabase });
			newDb.value = { name: "", path: "" };
		} catch (e) {
			console.error("Failed to create database:", e);
		} finally {
			isCreatingDb.value = false;
		}
	}

	async function confirmDelete(db: DatabaseInfo) {
		if (confirm(`Delete database '${db.name}'? This cannot be undone.`)) {
			try {
				await remove(db.path);
				const updated = props.databases.filter((d) => d.path !== db.path);
				let selected = props.selectedDatabase;
				if (selected && selected.path === db.path) selected = null;
				emit("update", { databases: updated, selectedDatabase: selected });
			} catch (e) {
				console.error("Failed to delete database:", e);
			}
		}
	}

	onMounted(() => {
	// Optionally, load databases from a config or scan a directory
	// For now, databases are only added via the form
	});
</script>
