<template>
	<div class="p-4">
		<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
			Edit Row
		</h2>

		<form class="space-y-4" @submit.prevent="updateRow">
			<UFormField
				v-for="column in table.columns"
				:key="column.name"
				:label="column.name"
				:required="!column.nullable"
			>
				<UInput
					v-model="form[column.name]"
					:type="getInputType(column.type)"
					:placeholder="getPlaceholder(column)"
					:error="errors[column.name]"
					:disabled="column.primaryKey"
				/>
			</UFormField>

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
					Update Row
				</UButton>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
	import Database from "@tauri-apps/plugin-sql";
	import { computed, onMounted, ref } from "vue";

	interface DatabaseInfo {
		name: string
		path: string
		tables: any[]
	}

	interface TableInfo {
		name: string
		columns: ColumnInfo[]
	}

	interface ColumnInfo {
		name: string
		type: string
		nullable: boolean
		primaryKey: boolean
		defaultValue?: string
	}

	const props = defineProps<{
		table: TableInfo
		database: DatabaseInfo
		row: Record<string, any>
	}>();

	const emit = defineEmits<{
		updated: []
		close: []
	}>();

	const form = ref<Record<string, any>>({});
	const errors = ref<Record<string, string>>({});
	const isLoading = ref(false);

	const isValid = computed(() => {
		return props.table.columns.every((column) => {
			if (!column.nullable && !column.primaryKey) {
				return form.value[column.name] !== undefined && form.value[column.name] !== "";
			}
			return true;
		});
	});

	const getInputType = (type: string) => {
		switch (type.toUpperCase()) {
		case "INTEGER":
			return "number";
		case "REAL":
			return "number";
		case "BOOLEAN":
			return "checkbox";
		case "DATE":
			return "date";
		case "DATETIME":
			return "datetime-local";
		default:
			return "text";
		}
	};

	const getPlaceholder = (column: ColumnInfo) => {
		if (column.defaultValue) {
			return `Default: ${column.defaultValue}`;
		}
		return column.nullable ? "Optional" : "Required";
	};

	const updateRow = async () => {
		if (!isValid.value) return;

		// Guard: skip if demo database (no real path)
		if (!props.database.path) {
			console.warn("Demo database: cannot update real rows.");
			emit("updated");
			return;
		}

		isLoading.value = true;
		errors.value = {};

		try {
			const db = await Database.load(`sqlite:${props.database.path}`);

			const primaryKey = props.table.columns.find((col) => col.primaryKey);
			if (!primaryKey) {
				throw new Error("No primary key found");
			}

			const columns = props.table.columns
				.filter((col) => !col.primaryKey)
				.map((col) => col.name);
			const values = columns.map((colName) => form.value[colName]);

			const sql = `
      UPDATE ${props.table.name}
      SET ${columns.map((col) => `${col} = ?`).join(", ")}
      WHERE ${primaryKey.name} = ?
    `;

			await db.execute(sql, [...values, props.row[primaryKey.name]]);
			emit("updated");
		} catch (e) {
			console.error("Failed to update row:", e);
			errors.value = { _error: "Failed to update row" };
		} finally {
			isLoading.value = false;
		}
	};

	onMounted(() => {
		// Initialize form with current row values
		props.table.columns.forEach((column) => {
			form.value[column.name] = props.row[column.name];
		});
	});
</script>
