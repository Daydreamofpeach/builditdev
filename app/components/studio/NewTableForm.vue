<template>
	<div class="p-4">
		<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
			Create New Table
		</h2>

		<form class="space-y-4" @submit.prevent="createTable">
			<UFormField label="Table Name" required>
				<UInput
					v-model="form.name"
					placeholder="Enter table name"
					:error="errors.name"
				/>
			</UFormField>

			<!-- Columns -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100">
						Columns
					</h3>
					<UButton
						color="primary"
						variant="soft"
						size="xs"
						@click="addColumn"
					>
						Add Column
					</UButton>
				</div>

				<div v-if="form.columns.length === 0" class="text-center py-4">
					<p class="text-sm text-neutral-500 dark:text-neutral-400">
						No columns added yet
					</p>
				</div>

				<div v-else class="space-y-4">
					<div
						v-for="(column, index) in form.columns"
						:key="index"
						class="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-4"
					>
						<div class="flex items-center justify-between">
							<h4 class="font-medium text-neutral-900 dark:text-neutral-100">
								Column {{ index + 1 }}
							</h4>
							<UButton
								color="error"
								variant="soft"
								size="xs"
								@click="removeColumn(index)"
							>
								Remove
							</UButton>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<UFormField label="Name" required>
								<UInput
									v-model="column.name"
									placeholder="Column name"
									:error="errors.columns?.[index]?.name"
								/>
							</UFormField>

							<UFormField label="Type" required>
								<USelectMenu
									v-model="column.type"
									:items="columnTypes"
									value-attribute="value"
									option-attribute="label"
									placeholder="Select type"
									class="w-48"
								/>
							</UFormField>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<UFormField>
								<UCheckbox
									v-model="column.nullable"
									label="Nullable"
								/>
							</UFormField>

							<UFormField>
								<UCheckbox
									v-model="column.primaryKey"
									label="Primary Key"
								/>
							</UFormField>
						</div>

						<UFormField label="Default Value">
							<UInput
								v-model="column.defaultValue"
								placeholder="Default value (optional)"
							/>
						</UFormField>
					</div>
				</div>
			</div>

			<div class="flex justify-end gap-2 pt-4">
				<UButton
					color="neutral"
					variant="soft"
					@click="$emit('close')"
				>
					Cancel
				</UButton>
				<UButton
					type="submit"
					color="primary"
					:loading="isLoading"
					:disabled="!isValid"
				>
					Create Table
				</UButton>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
	import type { DropdownMenuItem } from "@nuxt/ui";
	import Database from "@tauri-apps/plugin-sql";
	import { computed, ref } from "vue";

	interface DatabaseInfo {
		name: string
		path: string
		tables: any[]
	}

	interface ColumnInfo {
		name: string
		type: { label: string, value: string } | undefined
		nullable: boolean
		primaryKey: boolean
		defaultValue?: string
	}

	const props = defineProps<{
		database: DatabaseInfo | null
	}>();

	const emit = defineEmits<{
		created: []
		close: []
	}>();

	const columnTypes = [
		{ label: "INTEGER", value: "INTEGER" },
		{ label: "REAL", value: "REAL" },
		{ label: "TEXT", value: "TEXT" },
		{ label: "BLOB", value: "BLOB" },
		{ label: "BOOLEAN", value: "BOOLEAN" },
		{ label: "DATE", value: "DATE" },
		{ label: "DATETIME", value: "DATETIME" }
	];

	const form = ref({
		name: "",
		columns: [] as ColumnInfo[]
	});

	const errors = ref({
		name: "",
		columns: [] as Array<{
			name?: string
			type?: string
		}>
	});

	const isLoading = ref(false);

	const isValid = computed(() => {
		if (!form.value.name.trim()) return false;
		if (form.value.columns.length === 0) return false;
		return form.value.columns.every((column) =>
			column.name.trim() !== "" && !!column.type?.value
		);
	});

	const addColumn = () => {
		form.value.columns.push({
			name: "",
			type: undefined,
			nullable: false,
			primaryKey: false
		});
	};

	const removeColumn = (index: number) => {
		form.value.columns.splice(index, 1);
	};

	const createTable = async () => {
		if (!isValid.value || !props.database) return;

		// Guard: skip if demo database (no real path)
		if (!props.database.path) {
			// Optionally show a toast or message
			console.warn("Demo database: cannot create real tables.");
			emit("created"); // Optionally simulate success for demo
			return;
		}

		isLoading.value = true;
		errors.value = { name: "", columns: [] };

		try {
			const db = await Database.load(`sqlite:${props.database.path}`);

			// Build CREATE TABLE statement
			const columns = form.value.columns.map((col) => {
				let def = `${col.name} ${col.type?.value || ""}`;
				if (col.primaryKey) def += " PRIMARY KEY";
				if (!col.nullable) def += " NOT NULL";
				if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
				return def;
			});

			const sql = `
      CREATE TABLE ${form.value.name} (
        ${columns.join(",\n        ")}
      )
    `;

			await db.execute(sql);
			emit("created");
		} catch (e) {
			console.error("Failed to create table:", e);
			errors.value.name = "Failed to create table";
		} finally {
			isLoading.value = false;
		}
	};
</script>
