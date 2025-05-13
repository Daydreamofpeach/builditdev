<template>
	<div class="p-4">
		<h1 class="text-2xl font-bold mb-4">
			SQL Database Manager
		</h1>

		<!-- Table Management -->
		<div class="mb-6 p-4 border rounded-lg">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold">
					Tables
				</h2>
				<UButton
					variant="solid"

					class="bg-primary/50 text-gray-300 px-4 py-2 rounded font-silkscreen"
					@click="showCreateTableModal = true"
				>
					Create New Table
				</UButton>
			</div>

			<!-- Table List -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div
					v-for="table in tables"
					:key="table.name"
					class="border rounded-lg p-4 hover:shadow-md transition-shadow"
				>
					<div class="flex justify-between items-start">
						<div>
							<h3 class="font-semibold text-lg">
								{{ table.name }}
							</h3>
							<p class="text-sm text-gray-300">
								{{ table.rowCount }} rows
							</p>
						</div>
						<div class="flex gap-2">
							<UButton
								class=""
								size="sm"
								variant="outline"
								@click="selectTable(table.name)"
							>
								View
							</UButton>
							<UButton
								class="text-gray-300 hover:text-primary"
								variant="outline"
								size="sm"
								@click="showEditTableModal(table)"
							>
								Edit
							</UButton>
							<UButton
								variant="outline"
								size="sm"
								class="text-warning outline-warning hover:text-error"
								@click="confirmDeleteTable(table.name)"
							>
								Delete
							</UButton>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Table View -->
		<div v-if="selectedTable" class="mb-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-semibold">
					{{ selectedTable }}
				</h2>
				<div class="flex gap-2">
					<button
						class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
						@click="showAddColumnModal = true"
					>
						Add Column
					</button>
					<button
						class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
						@click="addNewRow"
					>
						Add Row
					</button>
				</div>
			</div>

			<!-- Grid View -->
			<div class="overflow-x-auto">
				<table class="min-w-full border">
					<thead>
						<tr>
							<th
								v-for="column in tableColumns"
								:key="column.name"
								class="border p-2 bg-gray-50 text-left"
							>
								<div class="flex items-center gap-2">
									<span>{{ column.name }}</span>
									<span class="text-xs text-gray-500">({{ column.type }})</span>
									<button
										v-if="!column.isPrimary"
										class="text-gray-400 hover:text-gray-600"
										@click="editColumn(column)"
									>
										Edit
									</button>
								</div>
							</th>
							<th class="border p-2 bg-gray-50">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
							<td
								v-for="column in tableColumns"
								:key="column.name"
								class="border p-2"
							>
								<input
									v-if="isEditing(rowIndex, column.name)"
									v-model="editingCell.value"
									:type="getInputType(column.type)"
									class="w-full p-1 border rounded"
									@blur="saveCell(rowIndex, column.name)"
									@keyup.enter="saveCell(rowIndex, column.name)"
								>
								<div
									v-else
									class="cursor-pointer hover:bg-gray-50 p-1 rounded"
									@click="startEditing(rowIndex, column.name, row[column.name])"
								>
									{{ formatCellValue(row[column.name], column.type) }}
								</div>
							</td>
							<td class="border p-2">
								<button
									class="text-red-500 hover:text-red-700"
									@click="deleteRow(rowIndex)"
								>
									Delete
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<!-- Create Table Modal -->
		<div v-if="showCreateTableModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div class="bg-white p-6 rounded-lg w-full max-w-2xl">
				<h3 class="text-xl font-semibold mb-4">
					Create New Table
				</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Table Name</label>
						<input
							v-model="newTable.name"
							type="text"
							class="mt-1 block w-full border rounded-md p-2"
							placeholder="Enter table name"
						>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Columns</label>
						<div v-for="(column, index) in newTable.columns" :key="index" class="flex gap-2 mt-2">
							<input
								v-model="column.name"
								type="text"
								class="flex-1 border rounded-md p-2"
								placeholder="Column name"
							>
							<select
								v-model="column.type"
								class="border rounded-md p-2"
							>
								<option value="TEXT">
									Text
								</option>
								<option value="INTEGER">
									Number
								</option>
								<option value="REAL">
									Decimal
								</option>
								<option value="BOOLEAN">
									Boolean
								</option>
								<option value="DATETIME">
									Date/Time
								</option>
							</select>
							<label class="flex items-center gap-2">
								<input
									v-model="column.isPrimary"
									type="checkbox"
									class="rounded"
								>
								Primary Key
							</label>
							<button
								class="text-red-500"
								@click="removeColumn(index)"
							>
								Remove
							</button>
						</div>
						<button
							class="mt-2 text-blue-500"
							@click="addColumn"
						>
							Add Column
						</button>
					</div>
					<div class="flex justify-end gap-2 mt-4">
						<button
							class="px-4 py-2 border rounded"
							@click="showCreateTableModal = false"
						>
							Cancel
						</button>
						<button
							class="px-4 py-2 bg-blue-500 text-white rounded"
							@click="createTable"
						>
							Create Table
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Add Column Modal -->
		<div v-if="showAddColumnModal" class="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center">
			<div class="bg-black p-6 rounded-lg w-full max-w-md">
				<h3 class="text-xl font-semibold mb-4">
					Add Column
				</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Column Name</label>
						<input
							v-model="newColumn.name"
							type="text"
							class="mt-1 block w-full border rounded-md p-2"
							placeholder="Enter column name"
						>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Data Type</label>
						<select
							v-model="newColumn.type"
							class="mt-1 block w-full border rounded-md p-2"
						>
							<option value="TEXT">
								Text
							</option>
							<option value="INTEGER">
								Number
							</option>
							<option value="REAL">
								Decimal
							</option>
							<option value="BOOLEAN">
								Boolean
							</option>
							<option value="DATETIME">
								Date/Time
							</option>
						</select>
					</div>
					<div class="flex justify-end gap-2 mt-4">
						<button
							class="px-4 py-2 border rounded"
							@click="showAddColumnModal = false"
						>
							Cancel
						</button>
						<button
							class="px-4 py-2 bg-blue-500 text-white rounded"
							@click="addColumnToTable"
						>
							Add Column
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import Database from "@tauri-apps/plugin-sql";
	import { computed, ref } from "vue";

	interface Column {
		name: string
		type: string
		isPrimary?: boolean
	}

	interface Table {
		name: string
		rowCount: number
	}

	interface TableColumn extends Column {
		isPrimary: boolean
	}

	const db = ref<any>(null);
	const tables = ref<Table[]>([]);
	const selectedTable = ref<string | null>(null);
	const tableColumns = ref<TableColumn[]>([]);
	const tableData = ref<any[]>([]);
	const showCreateTableModal = ref(false);
	const showAddColumnModal = ref(false);
	const newTable = ref({
		name: "",
		columns: [] as Column[]
	});
	const newColumn = ref<Column>({
		name: "",
		type: "TEXT"
	});
	const editingCell = ref({
		rowIndex: -1,
		columnName: "",
		value: null
	});

	// Fetch all tables
	const fetchTables = async () => {
		try {
			const result = await db.value.select(`
				SELECT name FROM sqlite_master 
				WHERE type='table' AND name NOT LIKE 'sqlite_%'
			`);
			tables.value = await Promise.all(
				result.map(async (table: { name: string }) => {
					const countResult = await db.value.select(
						`SELECT COUNT(*) as count FROM ${table.name}`
					);
					return {
						name: table.name,
						rowCount: countResult[0].count
					};
				})
			);
		} catch (e) {
			console.error("Failed to fetch tables:", e);
		}
	};

	// Fetch table structure
	const fetchTableStructure = async (tableName: string) => {
		try {
			const result = await db.value.select(`PRAGMA table_info(${tableName})`);
			tableColumns.value = result.map((col: any) => ({
				name: col.name,
				type: col.type,
				isPrimary: col.pk === 1
			}));
		} catch (e) {
			console.error("Failed to fetch table structure:", e);
		}
	};

	// Fetch table data
	const fetchTableData = async (tableName: string) => {
		try {
			tableData.value = await db.value.select(`SELECT * FROM ${tableName}`);
		} catch (e) {
			console.error("Failed to fetch table data:", e);
		}
	};

	// Initialize database
	const initDb = async () => {
		try {
			db.value = await Database.load("sqlite:test.db");
			await fetchTables();
		} catch (e) {
			console.error("Failed to initialize database:", e);
		}
	};

	// Select a table
	const selectTable = async (tableName: string) => {
		selectedTable.value = tableName;
		await fetchTableStructure(tableName);
		await fetchTableData(tableName);
	};

	// Create new table
	const createTable = async () => {
		if (!newTable.value.name || newTable.value.columns.length === 0) return;

		try {
			const columns = newTable.value.columns.map((col) => {
				let def = `${col.name} ${col.type}`;
				if (col.isPrimary) def += " PRIMARY KEY";
				return def;
			}).join(", ");

			await db.value.execute(
				`CREATE TABLE ${newTable.value.name} (${columns})`
			);

			showCreateTableModal.value = false;
			newTable.value = { name: "", columns: [] };
			await fetchTables();
		} catch (e) {
			console.error("Failed to create table:", e);
		}
	};

	// Add column to table
	const addColumnToTable = async () => {
		if (!selectedTable.value || !newColumn.value.name) return;

		try {
			await db.value.execute(
				`ALTER TABLE ${selectedTable.value} ADD COLUMN ${newColumn.value.name} ${newColumn.value.type}`
			);

			showAddColumnModal.value = false;
			newColumn.value = { name: "", type: "TEXT" };
			await fetchTableStructure(selectedTable.value);
			await fetchTableData(selectedTable.value);
		} catch (e) {
			console.error("Failed to add column:", e);
		}
	};

	// Add new row
	const addNewRow = async () => {
		if (!selectedTable.value) return;

		try {
			const columns = tableColumns.value
				.filter((col) => !col.isPrimary)
				.map((col) => col.name)
				.join(", ");
			const placeholders = tableColumns.value
				.filter((col) => !col.isPrimary)
				.map(() => "?")
				.join(", ");

			await db.value.execute(
				`INSERT INTO ${selectedTable.value} (${columns}) VALUES (${placeholders})`,
				tableColumns.value
					.filter((col) => !col.isPrimary)
					.map(() => null)
			);

			await fetchTableData(selectedTable.value);
		} catch (e) {
			console.error("Failed to add row:", e);
		}
	};

	// Delete row
	const deleteRow = async (rowIndex: number) => {
		if (!selectedTable.value) return;

		const row = tableData.value[rowIndex];
		const primaryKey = tableColumns.value.find((col) => col.isPrimary);
		if (!primaryKey) return;

		try {
			await db.value.execute(
				`DELETE FROM ${selectedTable.value} WHERE ${primaryKey.name} = ?`,
				[row[primaryKey.name]]
			);

			await fetchTableData(selectedTable.value);
		} catch (e) {
			console.error("Failed to delete row:", e);
		}
	};

	// Cell editing
	const isEditing = (rowIndex: number, columnName: string) => {
		return editingCell.value.rowIndex === rowIndex && editingCell.value.columnName === columnName;
	};

	const startEditing = (rowIndex: number, columnName: string, value: any) => {
		editingCell.value = { rowIndex, columnName, value };
	};

	const saveCell = async (rowIndex: number, columnName: string) => {
		if (!selectedTable.value) return;

		const row = tableData.value[rowIndex];
		const primaryKey = tableColumns.value.find((col) => col.isPrimary);
		if (!primaryKey) return;

		try {
			await db.value.execute(
				`UPDATE ${selectedTable.value} SET ${columnName} = ? WHERE ${primaryKey.name} = ?`,
				[editingCell.value.value, row[primaryKey.name]]
			);

			editingCell.value = { rowIndex: -1, columnName: "", value: null };
			await fetchTableData(selectedTable.value);
		} catch (e) {
			console.error("Failed to update cell:", e);
		}
	};

	// Helper functions
	const getInputType = (columnType: string) => {
		switch (columnType.toUpperCase()) {
		case "INTEGER":
			return "number";
		case "REAL":
			return "number";
		case "BOOLEAN":
			return "checkbox";
		case "DATETIME":
			return "datetime-local";
		default:
			return "text";
		}
	};

	const formatCellValue = (value: any, type: string) => {
		if (value === null || value === undefined) return "";
		switch (type.toUpperCase()) {
		case "BOOLEAN":
			return value ? "Yes" : "No";
		case "DATETIME":
			return new Date(value).toLocaleString();
		default:
			return value.toString();
		}
	};

	const addColumn = () => {
		newTable.value.columns.push({
			name: "",
			type: "TEXT",
			isPrimary: false
		});
	};

	const removeColumn = (index: number) => {
		newTable.value.columns.splice(index, 1);
	};

	const confirmDeleteTable = async (tableName: string) => {
		if (window.confirm(`Are you sure you want to delete the table "${tableName}"?`)) {
			try {
				await db.value.execute(`DROP TABLE ${tableName}`);
				if (selectedTable.value === tableName) {
					selectedTable.value = null;
				}
				await fetchTables();
			} catch (e) {
				console.error("Failed to delete table:", e);
			}
		}
	};

	// Initialize
	initDb();
</script>
