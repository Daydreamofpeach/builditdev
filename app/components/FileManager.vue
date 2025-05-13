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

		<!-- List newly created files -->
		<div v-if="createdFiles.length" class="mt-6">
			<h3 class="font-semibold mb-2">Newly Created Files</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div v-for="file in createdFiles" :key="file.name" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
					<h4 class="font-medium break-all">{{ file.name }}</h4>
					<p class="text-xs text-gray-500 dark:text-gray-400 break-all">Created just now</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
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

	const toast = useToast();
	const createdFiles = ref<{ name: string }[]>([]);

	// Tauri store for files
	const store = await useTauriStoreLoad('files.bin', { autoSave: true });

	// Load files from store on mount
	onMounted(async () => {
		try {
			const files = await store.get<{ name: string }[]>('files');
			if (Array.isArray(files)) {
				createdFiles.value = files;
			}
		} catch {}
	});

	const saveFiles = async () => {
		await store.set('files', createdFiles.value);
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
</script> 