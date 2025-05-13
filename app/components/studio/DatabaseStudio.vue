<template>
	<div class="h-full flex flex-col bg-neutral-950">
		<!-- Header -->
		<div class="border-b border-neutral-800 p-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<UButton
					:icon="isSidebarOpen ? 'i-lucide-chevron-left' : 'i-lucide-chevron-right'"
					color="neutral"
					variant="subtle"
					aria-label="Toggle sidebar"
					@click="toggleSidebar"
				/>
				<h1 class="text-2xl font-semibold text-neutral-100">
					Database Studio
				</h1>
			</div>
			<div class="flex items-center gap-2">
				<UButton
					v-if="!selectedDatabase && !showNewDatabaseForm"
					color="primary"
					variant="solid"
					@click="showNewDatabaseForm = true"
				>
					New Database
				</UButton>
				<UButton
					v-else-if="selectedDatabase && !showNewTableForm"
					color="primary"
					variant="solid"
					@click="showNewTableForm = true"
				>
					New Table
				</UButton>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 flex flex-col md:flex-row overflow-hidden">
			<!-- Sidebar -->
			<DatabaseSidebar
				:databases="databases"
				:selected-database="selectedDatabase"
				:is-open="isSidebarOpen"
				@toggle="toggleSidebar"
				@select-table="onSelectDatabase"
				@refresh="refreshDatabase"
				@update="onSidebarUpdate"
			/>

			<!-- Main Area -->
			<div class="flex-1 p-4 overflow-y-auto">
				<div v-if="showNewDatabaseForm">
					<NewDatabaseForm @created="onDatabaseCreated" @close="showNewDatabaseForm = false" />
				</div>
				<div v-else-if="showNewTableForm">
					<NewTableForm :database="selectedDatabase" @created="onTableCreated" @close="showNewTableForm = false" />
				</div>
				<div v-else-if="!selectedDatabase" class="h-full flex items-center justify-center">
					<div class="text-center">
						<h2 class="text-xl font-medium text-neutral-300 mb-2">
							No Database Selected
						</h2>
						<p class="text-neutral-500 mb-4">
							Select a demo database or create a new one to get started
						</p>
						<div class="flex flex-wrap gap-4 justify-center mb-6">
							<UButton
								v-for="demo in demoDatabases"
								:key="demo.name"
								color="neutral"
								variant="soft"
								@click="selectDemoDatabase(demo)"
							>
								{{ demo.name }}
							</UButton>
						</div>
						<UButton
							color="primary"
							variant="solid"
							@click="showNewDatabaseForm = true"
						>
							Create New Database
						</UButton>
					</div>
				</div>
				<div v-else>
					<!-- Top bar for table actions -->
					<div class="flex items-center justify-between mb-4 sticky top-0 z-10 bg-neutral-950/90 backdrop-blur">
						<div class="flex gap-2">
							<UButton color="neutral" variant="soft" icon="i-heroicons-funnel" label="Filters" />
							<UButton color="neutral" variant="soft" icon="i-heroicons-table" label="Columns" />
							<UButton color="primary" variant="solid" icon="i-heroicons-plus" label="Add record" @click="addRow" />
						</div>
						<div class="flex items-center gap-2">
							<span class="text-neutral-400 text-sm">50 records</span>
							<UInput type="number" class="w-16" :model-value="50" />
							<UButton icon="i-heroicons-arrow-path" color="neutral" variant="soft" @click="refreshDatabase" />
						</div>
					</div>
					<TableEditor
						v-if="selectedTable"
						:table="selectedTable"
						:database="selectedDatabase"
						@refresh="refreshDatabase"
					/>
					<div v-else class="h-full flex items-center justify-center">
						<div class="text-center">
							<h2 class="text-xl font-medium text-neutral-300 mb-2">
								No Table Selected
							</h2>
							<p class="text-neutral-500 mb-4">
								Select a table from the sidebar or create a new one
							</p>
							<UButton
								color="primary"
								variant="solid"
								@click="showNewTableForm = true"
							>
								Create New Table
							</UButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from "vue";
	import DatabaseSidebar from "./DatabaseSidebar.vue";
	import demoDatabasesRaw from "./demoDatabases.json";
	import NewDatabaseForm from "./NewDatabaseForm.vue";
	import NewTableForm from "./NewTableForm.vue";
	import TableEditor from "./TableEditor.vue";

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

	const databases = ref<DatabaseInfo[]>([]);
	const selectedDatabase = ref<DatabaseInfo | null>(null);
	const selectedTable = ref<TableInfo | null>(null);
	const showNewDatabaseForm = ref(false);
	const showNewTableForm = ref(false);
	const demoDatabases = ref<any[]>([]);
	const isSidebarOpen = ref(false);

	onMounted(() => {
		demoDatabases.value = demoDatabasesRaw;
	});

	function onSidebarUpdate({ databases: newDbs, selectedDatabase: selDb }: { databases: DatabaseInfo[], selectedDatabase: DatabaseInfo | null }) {
		databases.value = newDbs;
		selectedDatabase.value = selDb;
	}

	function onSelectDatabase(db: DatabaseInfo) {
		selectedDatabase.value = db;
		selectedTable.value = null;
	}

	function selectDemoDatabase(demo: any) {
		const db: DatabaseInfo = {
			name: demo.name,
			path: "",
			tables: demo.tables || []
		};
		databases.value.push(db);
		selectedDatabase.value = db;
		selectedTable.value = null;
	}

	function addRow() {
		// This can be implemented to open the add row form in TableEditor
	}

	async function refreshDatabase() {
		// Placeholder for refresh logic
	}

	function onDatabaseCreated(database: DatabaseInfo) {
		databases.value.push({ ...database, tables: database.tables || [] });
		selectedDatabase.value = { ...database, tables: database.tables || [] };
		showNewDatabaseForm.value = false;
	}

	function onTableCreated() {
		showNewTableForm.value = false;
	}

	function toggleSidebar() {
		isSidebarOpen.value = !isSidebarOpen.value;
	}
</script>
