<template>
	<div class="p-4">
		<h1 class="text-2xl font-bold mb-4">
			SQL Plugin Test
		</h1>

		<!-- Create Table Form -->
		<div class="mb-6 p-4 border rounded-lg">
			<h2 class="text-xl font-semibold mb-2">
				Create Test Table
			</h2>
			<button
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				:disabled="isLoading"
				@click="createTable"
			>
				Create Test Table
			</button>
		</div>

		<!-- Insert Data Form -->
		<div class="mb-6 p-4 border rounded-lg">
			<h2 class="text-xl font-semibold mb-2">
				Insert Test Data
			</h2>
			<div class="space-y-2">
				<input
					v-model="newItem.name"
					placeholder="Name"
					class="border p-2 rounded w-full"
				>
				<input
					v-model="newItem.description"
					placeholder="Description"
					class="border p-2 rounded w-full"
				>
				<button
					class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
					:disabled="isLoading"
					@click="insertData"
				>
					Insert Data
				</button>
			</div>
		</div>

		<!-- Display Data -->
		<div class="mb-6 p-4 border rounded-lg">
			<h2 class="text-xl font-semibold mb-2">
				Test Data
			</h2>
			<button
				class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mb-4"
				:disabled="isLoading"
				@click="fetchData"
			>
				Refresh Data
			</button>

			<div v-if="error" class="text-red-500 mb-4">
				{{ error }}
			</div>

			<div v-if="items.length === 0" class="text-gray-500">
				No data available
			</div>

			<table v-else class="min-w-full">
				<thead>
					<tr>
						<th class="text-left p-2">
							ID
						</th>
						<th class="text-left p-2">
							Name
						</th>
						<th class="text-left p-2">
							Description
						</th>
						<th class="text-left p-2">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in items" :key="item.id" class="border-t">
						<td class="p-2">
							{{ item.id }}
						</td>
						<td class="p-2">
							{{ item.name }}
						</td>
						<td class="p-2">
							{{ item.description }}
						</td>
						<td class="p-2">
							<button
								class="text-red-500 hover:text-red-700"
								:disabled="isLoading"
								@click="deleteItem(item.id)"
							>
								Delete
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
	import Database from "@tauri-apps/plugin-sql";
	import { ref } from "vue";

	const isLoading = ref(false);
	const error = ref("");
	const items = ref<Array<{ id: number, name: string, description: string }>>([]);
	const newItem = ref({ name: "", description: "" });

	let db: any = null;

	// Initialize database connection
	const initDb = async () => {
		try {
			db = await Database.load("sqlite:test.db");
		} catch (e) {
			error.value = `Failed to initialize database: ${e}`;
		}
	};

	// Fetch all data
	const fetchData = async () => {
		if (!db) await initDb();
		isLoading.value = true;
		error.value = "";

		try {
			const result = await db.select("SELECT * FROM test_items ORDER BY id DESC");
			items.value = result;
		} catch (e) {
			error.value = `Failed to fetch data: ${e}`;
		} finally {
			isLoading.value = false;
		}
	};

	// Create test table
	const createTable = async () => {
		if (!db) await initDb();
		isLoading.value = true;
		error.value = "";

		try {
			await db.execute(`
      CREATE TABLE IF NOT EXISTS test_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
      )
    `);
			await fetchData();
		} catch (e) {
			error.value = `Failed to create table: ${e}`;
		} finally {
			isLoading.value = false;
		}
	};

	// Insert new data
	const insertData = async () => {
		if (!db) await initDb();
		if (!newItem.value.name) {
			error.value = "Name is required";
			return;
		}

		isLoading.value = true;
		error.value = "";

		try {
			await db.execute(
				"INSERT INTO test_items (name, description) VALUES (?, ?)",
				[newItem.value.name, newItem.value.description]
			);
			newItem.value = { name: "", description: "" };
			await fetchData();
		} catch (e) {
			error.value = `Failed to insert data: ${e}`;
		} finally {
			isLoading.value = false;
		}
	};

	// Delete item
	const deleteItem = async (id: number) => {
		if (!db) await initDb();
		isLoading.value = true;
		error.value = "";

		try {
			await db.execute("DELETE FROM test_items WHERE id = ?", [id]);
			await fetchData();
		} catch (e) {
			error.value = `Failed to delete item: ${e}`;
		} finally {
			isLoading.value = false;
		}
	};

	// Initialize database on component mount
	initDb();
</script>
