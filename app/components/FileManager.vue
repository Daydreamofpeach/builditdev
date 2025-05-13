<template>
	<div>
		<UForm :state="inputState" :schema="schema" class="flex flex-col gap-y-4 items-end" @submit="createFile">
			<UFormField label="Text file name (with extension)" name="fileName">
				<UInput v-model="inputState.fileName" variant="subtle" size="lg" />
			</UFormField>

			<UFormField label="File content" name="fileContent">
				<UTextarea v-model="inputState.fileContent" variant="subtle" size="lg" :rows="10" />
			</UFormField>

			<UButton type="submit" size="lg">
				Create file
			</UButton>
		</UForm>

		<!-- Create Folder Form -->
		<UForm :state="folderState" :schema="folderSchema" class="flex flex-col gap-y-4 items-end mt-8" @submit="createFolder">
			<UFormField label="Folder name" name="folderName">
				<UInput v-model="folderState.folderName" variant="subtle" size="lg" />
			</UFormField>
			<UButton type="submit" size="lg">
				Create folder
			</UButton>
		</UForm>

		<!-- List newly created files -->
		<div v-if="createdFiles.length" class="mt-6">
			<h3 class="font-semibold mb-2">
				Newly Created Files
			</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div v-for="file in createdFiles" :key="file.name" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<h4 class="font-medium break-all">
						{{ file.name }}
					</h4>
					<p class="text-xs text-gray-500 dark:text-gray-400 break-all">
						Created just now
					</p>
					<UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" class="ml-2" @click.stop="removeFile(file.name)">
						Remove
					</UButton>
					<UButton icon="i-lucide-file" color="primary" variant="ghost" size="xs" class="ml-2" @click.stop="openFile(file.name)">
						Open
					</UButton>
				</div>
			</div>
		</div>

		<!-- List newly created folders -->
		<div v-if="createdFolders.length" class="mt-6">
			<h3 class="font-semibold mb-2">
				Newly Created Folders
			</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div v-for="folder in createdFolders" :key="folder.name" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<h4 class="font-medium break-all">
						{{ folder.name }}
					</h4>
					<p class="text-xs text-gray-500 dark:text-gray-400 break-all">
						Created just now
					</p>
					<UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" class="ml-2" @click.stop="removeFolder(folder.name)">
						Remove
					</UButton>
					<UButton icon="i-lucide-folder-open" color="primary" variant="ghost" size="xs" class="ml-2" @click.stop="openFolder(folder.name)">
						Open
					</UButton>
				</div>
			</div>
		</div>

		<!-- File Content Modal -->
		<UModal v-model:open="fileContentModalOpen" title="File Contents" @close="fileContentModalOpen = false">
			<template #body>
				<div v-if="fileContentModal">
					<h4 class="font-medium mb-2">
						{{ fileContentModal.name }}
					</h4>
					<pre class="bg-gray-900 text-white p-2 rounded overflow-x-auto max-h-96">{{ fileContentModal.content }}</pre>
				</div>
			</template>
		</UModal>

		<!-- Folder Content Modal -->
		<UModal v-model:open="folderContentModalOpen" title="Folder Contents" @close="folderContentModalOpen = false">
			<template #body>
				<div v-if="folderContentModal">
					<h4 class="font-medium mb-2">
						{{ folderContentModal.name }}
					</h4>
					<ul class="list-disc ml-6">
						<li v-for="f in folderContentModal.files" :key="f">
							{{ f }}
						</li>
					</ul>
				</div>
			</template>
		</UModal>
	</div>
</template>

<script lang="ts" setup>
	import { BaseDirectory, mkdir, open, readDir, remove } from "@tauri-apps/plugin-fs";

	const schema = z.object({
		fileName: z.string({
			required_error: "File name is required"
		}).nonempty().regex(/^[\w,\s-]+\.[A-Z0-9]+$/i, {
			message: "Invalid filename format"
		}),
		fileContent: z.string({
			required_error: "File content is required"
		}).nonempty()
	});

	type Schema = zInfer<typeof schema>;

	const inputState = ref<Partial<Schema>>({
		fileName: undefined,
		fileContent: undefined
	});

	const folderSchema = z.object({
		folderName: z.string({
			required_error: "Folder name is required"
		}).nonempty()
	});
	const folderState = ref<{ folderName?: string }>({ folderName: undefined });

	const toast = useToast();
	const createdFiles = ref<{ name: string }[]>([]);
	const createdFolders = ref<{ name: string }[]>([]);

	// Tauri store for files and folders
	const store = await useTauriStoreLoad("files.bin", { autoSave: true });

	// Load files and folders from store on mount
	onMounted(async () => {
		try {
			const files = await store.get<{ name: string }[]>("files");
			if (Array.isArray(files)) {
				createdFiles.value = files;
			}
			const folders = await store.get<{ name: string }[]>("folders");
			if (Array.isArray(folders)) {
				createdFolders.value = folders;
			}
		} catch {}
	});

	const saveFiles = async () => {
		await store.set("files", createdFiles.value);
	};
	const saveFolders = async () => {
		await store.set("folders", createdFolders.value);
	};

	const createFile = async () => {
		try {
			const fileExists = await useTauriFsExists(inputState.value.fileName!, {
				baseDir: useTauriFsBaseDirectory.Document
			});

			if (fileExists) {
				toast.add({
					title: "Error",
					description: "The file already exists",
					color: "error"
				});

				return;
			}

			await useTauriFsWriteTextFile(inputState.value.fileName!, inputState.value.fileContent!, {
				baseDir: useTauriFsBaseDirectory.Document
			});
			toast.add({
				title: "Success",
				description: "The file has been created",
				color: "success"
			});
			createdFiles.value.unshift({ name: inputState.value.fileName! });
			await saveFiles();
			inputState.value.fileName = inputState.value.fileContent = undefined;
		} catch (err) {
			toast.add({
				title: "Error",
				description: String(err),
				color: "error"
			});
		}
	};

	const createFolder = async () => {
		try {
			if (!folderState.value.folderName) return;
			const folderExists = await useTauriFsExists(folderState.value.folderName, {
				baseDir: useTauriFsBaseDirectory.Document
			});
			if (folderExists) {
				toast.add({
					title: "Error",
					description: "The folder already exists",
					color: "error"
				});
				return;
			}
			await mkdir(folderState.value.folderName, {
				baseDir: BaseDirectory.Document
			});
			toast.add({
				title: "Success",
				description: "The folder has been created",
				color: "success"
			});
			createdFolders.value.unshift({ name: folderState.value.folderName });
			await saveFolders();
			folderState.value.folderName = undefined;
		} catch (err) {
			toast.add({
				title: "Error",
				description: String(err),
				color: "error"
			});
		}
	};

	const removeFile = async (fileName: string) => {
		try {
			await remove(fileName, { baseDir: BaseDirectory.Document });
			createdFiles.value = createdFiles.value.filter((f) => f.name !== fileName);
			await saveFiles();
			toast.add({ title: "Success", description: "File removed", color: "success" });
		} catch (err) {
			toast.add({ title: "Error", description: String(err), color: "error" });
		}
	};

	const removeFolder = async (folderName: string) => {
		try {
			await remove(folderName, { baseDir: BaseDirectory.Document, recursive: true });
			createdFolders.value = createdFolders.value.filter((f) => f.name !== folderName);
			await saveFolders();
			toast.add({ title: "Success", description: "Folder removed", color: "success" });
		} catch (err) {
			toast.add({ title: "Error", description: String(err), color: "error" });
		}
	};

	const fileContentModalOpen = ref(false);
	const folderContentModalOpen = ref(false);
	const fileContentModal = ref<{ name: string, content: string } | null>(null);
	const folderContentModal = ref<{ name: string, files: string[] } | null>(null);

	const openFile = async (fileName: string) => {
		try {
			const file = await open(fileName, { read: true, baseDir: BaseDirectory.Document });
			const stat = await file.stat();
			const buf = new Uint8Array(stat.size);
			await file.read(buf);
			const textContents = new TextDecoder().decode(buf);
			await file.close();
			fileContentModal.value = { name: fileName, content: textContents };
			fileContentModalOpen.value = true;
		} catch (err) {
			toast.add({ title: "Error", description: String(err), color: "error" });
		}
	};

	const openFolder = async (folderName: string) => {
		try {
			const entries = await readDir(folderName, {
				baseDir: BaseDirectory.Document
			});
			const files = entries.map((entry) => entry.name || "(unnamed)");
			folderContentModal.value = { name: folderName, files };
			folderContentModalOpen.value = true;
		} catch (err) {
			toast.add({ title: "Error", description: String(err), color: "error" });
		}
	};
</script>
