<template>
	<div class="h-full flex flex-col">
		<!-- Table Header -->
		<div class="flex items-center justify-between mb-4">
			<div>
				<h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
					{{ table.name }}
				</h2>
				<p class="text-sm text-neutral-500 dark:text-neutral-400">
					{{ table.columns.length }} columns
				</p>
			</div>
			<div class="flex items-center gap-2">
				<UButton
					color="primary"
					variant="soft"
					@click="showAddRowModal = true"
				>
					Add Row
				</UButton>
				<UButton
					color="neutral"
					variant="soft"
					@click="$emit('refresh')"
				>
					Refresh
				</UButton>
			</div>
		</div>

		<!-- Table Structure -->
		<div class="mb-6">
			<h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
				Structure
			</h3>
			<UTable
				:rows="table.columns"
				:columns="[
					{ accessorKey: 'name', header: 'Name' },
					{ accessorKey: 'type', header: 'Type' },
					{ accessorKey: 'nullable', header: 'Nullable' },
					{ accessorKey: 'primaryKey', header: 'Primary Key' },
					{ accessorKey: 'defaultValue', header: 'Default Value' }
				]"
			>
				<template #nullable-data="{ row }">
					<UBadge
						:color="row.getValue('nullable') ? 'success' : 'error'"
						variant="subtle"
					>
						{{ row.getValue('nullable') ? 'Yes' : 'No' }}
					</UBadge>
				</template>

				<template #primaryKey-data="{ row }">
					<UBadge
						:color="row.getValue('primaryKey') ? 'primary' : 'neutral'"
						variant="subtle"
					>
						{{ row.getValue('primaryKey') ? 'Yes' : 'No' }}
					</UBadge>
				</template>

				<template #defaultValue-data="{ row }">
					<span class="text-neutral-500 dark:text-neutral-400">
						{{ row.getValue('defaultValue') || '-' }}
					</span>
				</template>
			</UTable>

			<!-- Inline Add Column Form -->
			<div class="mt-4">
				<UForm :state="newColumn" class="flex flex-col gap-2" @submit.prevent="addColumn">
					<div class="flex gap-2">
						<UFormField label="Name" required>
							<UInput v-model="newColumn.name" placeholder="Column name" />
						</UFormField>
						<UFormField label="Type" required>
							<USelectMenu
								v-model="newColumn.type"
								:items="columnTypes"
								value-attribute="value"
								option-attribute="label"
								placeholder="Select type"
								class="w-32"
							/>
						</UFormField>
						<UFormField label="Nullable">
							<UCheckbox v-model="newColumn.nullable" />
						</UFormField>
						<UFormField label="Primary Key">
							<UCheckbox v-model="newColumn.primaryKey" />
						</UFormField>
						<UFormField label="Default Value">
							<UInput v-model="newColumn.defaultValue" placeholder="Default value (optional)" />
						</UFormField>
						<UButton type="submit" color="primary" class="self-end">
							Add Column
						</UButton>
					</div>
				</UForm>
			</div>
		</div>

		<!-- Table Data -->
		<div class="flex-1">
			<h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
				Data
			</h3>
			<div v-if="isLoading" class="flex items-center justify-center h-32">
				<UIcon name="i-heroicons-arrow-path" class="animate-spin text-primary-500" />
			</div>
			<div v-else-if="error" class="text-red-500 mb-4">
				{{ error }}
			</div>
			<div v-else-if="rows.length === 0" class="text-center py-8">
				<p class="text-neutral-500 dark:text-neutral-400">
					No data available
				</p>
			</div>
			<UTable
				v-else
				:rows="rows"
				:columns="columns"
			>
				<template #actions-data="{ row }">
					<div class="flex items-center gap-2">
						<UButton
							color="primary"
							variant="ghost"
							size="xs"
							@click="editRow(row)"
						>
							Edit
						</UButton>
						<UButton
							color="error"
							variant="ghost"
							size="xs"
							@click="deleteRow(row)"
						>
							Delete
						</UButton>
					</div>
				</template>
			</UTable>

			<!-- Inline Add Row Form -->
			<div class="mt-8">
				<AddRowForm
					:table="table"
					:database="database"
					@created="onRowCreated"
				/>
			</div>
		</div>

		<!-- Modals -->
		<UModal v-model="showEditRowModal">
			<EditRowForm
				v-if="selectedRow"
				:table="table"
				:database="database"
				:row="selectedRow"
				@updated="onRowUpdated"
			/>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	import Database from "@tauri-apps/plugin-sql";
	import { computed, onMounted, ref } from "vue";
	import AddRowForm from "./AddRowForm.vue";
	import EditRowForm from "./EditRowForm.vue";

	const props = defineProps<{
		table: TableInfo
		database: DatabaseInfo
	}>();

	const emit = defineEmits(["refresh"]);

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

	const rows = ref<any[]>([]);
	const isLoading = ref(false);
	const error = ref("");
	const showAddRowModal = ref(false);
	const showEditRowModal = ref(false);
	const selectedRow = ref<any>(null);

	const columns = computed(() => {
		const cols = props.table.columns.map((col) => ({
			accessorKey: col.name,
			header: col.name
		}));
		cols.push({ accessorKey: "actions", header: "Actions" });
		return cols;
	});

	let db: any = null;

	const initDb = async () => {
		if (!props.database.path) {
			// Demo mode: skip DB init
			db = null;
			return;
		}
		try {
			db = await Database.load(`sqlite:${props.database.path}`);
		} catch (e) {
			console.error("Failed to initialize database:", e);
			error.value = "Failed to connect to database";
		}
	};

	const fetchData = async () => {
		if (!props.database.path) {
			// Demo mode: skip DB fetch, optionally clear or simulate rows
			rows.value = [];
			return;
		}
		if (!db) await initDb();
		isLoading.value = true;
		error.value = "";

		try {
			const result = await db.select(`SELECT * FROM ${props.table.name}`);
			rows.value = result;
		} catch (e) {
			console.error("Failed to fetch data:", e);
			error.value = "Failed to fetch table data";
		} finally {
			isLoading.value = false;
		}
	};

	const editRow = (row: any) => {
		selectedRow.value = row;
		showEditRowModal.value = true;
	};

	const deleteRow = async (row: any) => {
		if (!props.database.path) {
			console.warn("Demo database: cannot delete real rows.");
			await fetchData();
			return;
		}
		if (!db) await initDb();
		isLoading.value = true;
		error.value = "";

		try {
			const primaryKey = props.table.columns.find((col) => col.primaryKey);
			if (!primaryKey) {
				throw new Error("No primary key found");
			}

			await db.execute(
				`DELETE FROM ${props.table.name} WHERE ${primaryKey.name} = ?`,
				[row[primaryKey.name]]
			);
			await fetchData();
		} catch (e) {
			console.error("Failed to delete row:", e);
			error.value = "Failed to delete row";
		} finally {
			isLoading.value = false;
		}
	};

	const onRowCreated = async () => {
		showAddRowModal.value = false;
		await fetchData();
	};

	const onRowUpdated = async () => {
		showEditRowModal.value = false;
		selectedRow.value = null;
		await fetchData();
	};

	const columnTypes = [
		{ label: "INTEGER", value: "INTEGER" },
		{ label: "REAL", value: "REAL" },
		{ label: "TEXT", value: "TEXT" },
		{ label: "BLOB", value: "BLOB" },
		{ label: "BOOLEAN", value: "BOOLEAN" },
		{ label: "DATE", value: "DATE" },
		{ label: "DATETIME", value: "DATETIME" }
	];

	const newColumn = ref({
		name: "",
		type: undefined,
		nullable: false,
		primaryKey: false,
		defaultValue: ""
	});

	const addColumn = async () => {
		if (!newColumn.value.name || !newColumn.value.type) return;
		if (!props.database.path) {
			console.warn("Demo database: cannot add real columns.");
			emit("refresh");
			newColumn.value = { name: "", type: undefined, nullable: false, primaryKey: false, defaultValue: "" };
			return;
		}
		try {
			if (!db) await initDb();
			let sql = `ALTER TABLE ${props.table.name} ADD COLUMN ${newColumn.value.name} ${newColumn.value.type}`;
			if (newColumn.value.primaryKey) sql += " PRIMARY KEY";
			if (!newColumn.value.nullable) sql += " NOT NULL";
			if (newColumn.value.defaultValue) sql += ` DEFAULT ${newColumn.value.defaultValue}`;
			await db.execute(sql);
			emit("refresh");
			newColumn.value = { name: "", type: undefined, nullable: false, primaryKey: false, defaultValue: "" };
		} catch (e) {
			console.error("Failed to add column:", e);
		}
	};

	onMounted(() => {
		initDb();
		fetchData();
	});
</script>
