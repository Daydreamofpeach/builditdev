<template>
	<div class="p-4">
		<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
			Add New Row
		</h2>

		<form class="space-y-4" @submit.prevent="addRow">
			<UFormField
				v-for="(column, idx) in columns"
				:key="idx"
				:label="(column as any).name"
				:required="!(column as any).nullable"
			>
				<UInput
					v-model="form[(column as any).name]"
					:type="getInputType((column as any).type)"
					:placeholder="getPlaceholder(column as any)"
					:error="errors[(column as any).name]"
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
					Add Row
				</UButton>
			</div>
		</form>
	</div>
</template>

<script setup lang="ts">
	import Database from "@tauri-apps/plugin-sql";
	import { computed, ref } from "vue";

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
	}>();

	const emit = defineEmits<{
		created: []
		close: []
	}>();

	const form = ref<Record<string, any>>({});
	const errors = ref<Record<string, string>>({});
	const isLoading = ref(false);

	const columns = computed(() =>
		(props.table.columns as any[]).filter((col) => typeof col === "object" && col !== null && "name" in col)
	);

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

	const addRow = async () => {
		if (!isValid.value) return;

		// Guard: skip if demo database (no real path)
		if (!props.database.path) {
			console.warn("Demo database: cannot add real rows.");
			emit("created");
			return;
		}

		isLoading.value = true;
		errors.value = {};

		try {
			const db = await Database.load(`sqlite:${props.database.path}`);

			const columns = props.table.columns
				.filter((col) => !col.primaryKey || form.value[col.name] !== undefined)
				.map((col) => col.name);
			const values = columns.map((col) => form.value[col.name]);

			const sql = `
      INSERT INTO ${props.table.name} (${columns.join(", ")})
      VALUES (${columns.map(() => "?").join(", ")})
    `;

			await db.execute(sql, values);
			emit("created");
		} catch (e) {
			console.error("Failed to add row:", e);
			errors.value = { _error: "Failed to add row" };
		} finally {
			isLoading.value = false;
		}
	};
</script>
