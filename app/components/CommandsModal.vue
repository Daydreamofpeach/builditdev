<template>
	<UModal v-model:open="open" title="Shell Commands" :ui="{ footer: 'justify-end', body: 'overflow-y-auto max-h-[90vh] p-2 sm:p-6' }">
		<template #body>
			<div class="space-y-6 md:space-y-8 w-full max-w-full">
				<UForm :state="inputState" :schema="schema" class="flex flex-col gap-y-4 items-end" @submit="sendCommand">
					<div class="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 w-full">
						<UFormField label="Shell type" name="shellType">
							<select
								v-model="inputState.shellType"
								class="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
							>
								<option value="pwsh">
									PowerShell
								</option>
								<option value="sh">
									Shell
								</option>
							</select>
						</UFormField>
						<UFormField label="Command input" name="input" class="flex-1">
							<UInput v-model="inputState.input" variant="subtle" size="lg" />
						</UFormField>
					</div>

					<div class="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 w-full">
						<UButton size="lg" variant="soft" @click="runCommand('Get-Process')">
							List Processes
						</UButton>
						<UButton size="lg" variant="soft" @click="runCommand('Get-Service')">
							List Services
						</UButton>
						<UButton size="lg" variant="soft" @click="runCommand('Get-NetIPAddress')">
							Network Info
						</UButton>
						<UButton type="submit" size="lg">
							Send command
						</UButton>
					</div>
				</UForm>

				<div class="border-t border-gray-200 dark:border-gray-800 pt-6">
					<h3 class="text-lg font-medium mb-4">
						Git Clone
					</h3>
					<div class="flex flex-col sm:flex-row gap-y-4 sm:gap-x-4 w-full">
						<UFormField label="Repository URL" name="gitUrl" class="flex-1">
							<UInput v-model="gitUrl" variant="subtle" size="lg" placeholder="https://github.com/username/repo.git" />
						</UFormField>
						<UButton size="lg" :loading="isCloning" @click="cloneRepo">
							Clone Repository
						</UButton>
					</div>
				</div>

				<div v-if="repositories.length > 0" class="border-t border-gray-200 dark:border-gray-800 pt-6">
					<h3 class="text-lg font-medium mb-4">
						Repositories
					</h3>
					<div class="flex flex-col gap-4 w-full">
						<div v-for="repo in repositories" :key="repo.path" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 w-full max-w-full">
							<div class="flex flex-col gap-2">
								<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 w-full">
									<div>
										<h4 class="font-medium break-all">
											{{ repo.name }}
										</h4>
										<p class="text-sm text-gray-500 dark:text-gray-400 break-all">
											{{ repo.url }}
										</p>
									</div>
									<div class="flex gap-2">
										<UButton
											icon="i-lucide-folder-open"
											color="neutral"
											variant="ghost"
											@click="exploreRepo(repo)"
										/>
										<UButton
											icon="i-lucide-trash"
											color="error"
											variant="ghost"
											@click="deleteRepo(repo)"
										/>
									</div>
								</div>
								<div v-if="repo.exploring" class="flex flex-col gap-2 w-full">
									<div class="mt-2">
										<div class="flex items-center gap-2 mb-2">
											<UInput
												v-model="repo.currentPath"
												variant="subtle"
												size="sm"
												class="flex-1"
												readonly
											/>
											<UButton
												icon="i-lucide-arrow-up"
												color="neutral"
												variant="ghost"
												size="sm"
												:disabled="repo.currentPath === repo.path"
												@click="navigateUp(repo)"
											/>
										</div>
										<div class="max-h-48 overflow-y-auto bg-gray-100 dark:bg-gray-900 rounded p-2">
											<div
												v-for="item in repo.items"
												:key="item.path"
												class="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer"
												@click="handleItemClick(repo, item)"
											>
												<UIcon
													:name="item.type === 'dir' ? 'i-lucide-folder' : 'i-lucide-file'"
													class="text-gray-500"
												/>
												<span class="text-sm break-all">{{ item.name }}</span>
											</div>
										</div>
									</div>
									<div class="mt-4">
										<h4 class="font-medium mb-2">
											Installation Requirements
										</h4>
										<div v-if="requirementsMap[repo.path] && requirementsMap[repo.path].requirements && requirementsMap[repo.path].requirements.length">
											<ul class="list-disc ml-6">
												<li v-for="req in requirementsMap[repo.path].requirements" :key="req">
													{{ req }}
												</li>
											</ul>
										</div>
										<div v-else class="text-gray-400">
											No requirements detected.
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<UForm :state="outputState" class="flex flex-col gap-y-4 items-end w-full">
					<UFormField label="Command output" name="command-output">
						<UTextarea v-model="outputState.output" variant="subtle" size="lg" :rows="8" readonly />
					</UFormField>
				</UForm>
			</div>
		</template>
		<template #footer>
			<UButton color="neutral" variant="outline" @click="open = false">
				Close
			</UButton>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	// All logic from commands.vue below

	const open = ref(false);

	defineExpose({ open });

	// ... rest of the script from commands.vue (except definePageMeta and LayoutTile) ...

	interface Repository {
		name: string
		url: string
		path: string
		exploring?: boolean
		currentPath?: string
		items?: Array<{
			name: string
			path: string
			type: "file" | "dir"
		}>
	}

	const schema = z.object({
		input: z.string({
			required_error: "Input is required"
		}).nonempty(),
		shellType: z.enum(["sh", "pwsh"], {
			required_error: "Shell type is required"
		})
	});

	type Schema = zInfer<typeof schema>;

	const inputState = ref<Partial<Schema>>({
		input: undefined,
		shellType: "pwsh"
	});
	const outputState = ref({
		output: ""
	});
	const gitUrl = ref("");
	const isCloning = ref(false);
	const repositories = ref<Repository[]>([]);
	const requirementsMap = ref<Record<string, { type: string, requirements: string[] }>>({});

	const knownManifests = [
		{ name: "package.json", type: "node" },
		{ name: "requirements.txt", type: "python" },
		{ name: "pyproject.toml", type: "python-toml" },
		{ name: "Cargo.toml", type: "rust" }
	];

	const fetchRequirements = async (repo: Repository) => {
		const reqs: { type: string, requirements: string[] }[] = [];
		for (const manifest of knownManifests) {
			const manifestPath = `${repo.path}\\${manifest.name}`;
			try {
				const commandName = "exec-pwsh";
				const response = await useTauriShellCommand.create(commandName, [
					"-Command",
					`if (Test-Path '${manifestPath}') { Get-Content '${manifestPath}' | Out-String } else { '' }`
				]).execute();
				if (response.code === 0 && response.stdout.trim()) {
					let requirements: string[] = [];
					if (manifest.type === "node") {
						try {
							const pkg = JSON.parse(response.stdout);
							requirements = [
								...Object.keys(pkg.dependencies || {}),
								...Object.keys(pkg.devDependencies || {})
							];
						} catch {}
					} else if (manifest.type === "python") {
						requirements = response.stdout.split(/\r?\n/).filter(Boolean);
					} else if (manifest.type === "python-toml" || manifest.type === "rust") {
						// Simple TOML parse for dependencies
						const depLines = response.stdout.split(/\r?\n/).filter((l) => l.match(/^\s*[^#[]/));
						requirements = depLines.filter((l) => l.includes("=")).map((l) => l.split("=")[0].trim());
					}
					reqs.push({ type: manifest.type, requirements });
				}
			} catch {}
		}
		requirementsMap.value[repo.path] = reqs.length
			? reqs.reduce((acc, cur) => ({
				type: cur.type,
				requirements: [...(acc.requirements || []), ...cur.requirements]
			}), { type: "", requirements: [] })
			: { type: "", requirements: [] };
	};

	// Initialize store for repositories
	const store = await useTauriStoreLoad("repositories.bin", {
		autoSave: true
	});

	// Load saved repositories
	const loadRepositories = async () => {
		try {
			const savedRepos = await store.get<Repository[]>("repositories") || [];
			// Filter out repositories whose directories no longer exist
			const validRepos = [];
			for (const repo of savedRepos) {
				try {
					const commandName = "exec-pwsh";
					const response = await useTauriShellCommand.create(commandName, [
						"-Command",
						`Test-Path -Path "${repo.path}"`
					]).execute();

					if (response.code === 0 && response.stdout.trim() === "True") {
						validRepos.push(repo);
					}
				} catch (error) {
					console.error(`Error checking repository ${repo.name}:`, error);
				}
			}
			repositories.value = validRepos;
			// Save the filtered list back to store
			await saveRepositories();
		} catch (error) {
			console.error("Error loading repositories:", error);
		}
	};

	// Save repositories to store
	const saveRepositories = async () => {
		try {
			await store.set("repositories", repositories.value);
		} catch (error) {
			console.error("Error saving repositories:", error);
		}
	};

	// Load repositories on component mount
	await loadRepositories();

	const cloneRepo = async () => {
		if (!gitUrl.value) {
			outputState.value.output = "Please enter a repository URL";
			return;
		}

		isCloning.value = true;
		try {
			const commandName = "exec-pwsh";
			const response = await useTauriShellCommand.create(commandName, [
				"-Command",
				`git clone ${gitUrl.value}`
			]).execute();

			// Format the output to be more readable
			const output = [];
			if (response.stdout) output.push(response.stdout);
			if (response.stderr) output.push(response.stderr);

			outputState.value.output = output.join("\n");

			if (response.code === 0) {
				outputState.value.output += "\n\nRepository cloned successfully!";

				// Extract repository name from URL
				const repoName = gitUrl.value.split("/").pop()?.replace(".git", "") || "";

				// Add to repositories list
				const newRepo: Repository = {
					name: repoName,
					url: gitUrl.value,
					path: repoName,
					exploring: false
				};

				repositories.value.push(newRepo);
				await saveRepositories();
			} else {
				outputState.value.output += "\n\nError: Clone operation failed.";
			}
		} catch (error) {
			outputState.value.output = `Error: ${error}`;
		} finally {
			isCloning.value = false;
			gitUrl.value = "";
		}
	};

	const exploreRepo = async (repo: Repository) => {
		repo.exploring = !repo.exploring;
		if (repo.exploring) {
			repo.currentPath = repo.path;
			await listDirectory(repo);
			await fetchRequirements(repo);
		}
	};

	const listDirectory = async (repo: Repository) => {
		try {
			const commandName = "exec-pwsh";
			const response = await useTauriShellCommand.create(commandName, [
				"-Command",
				`Get-ChildItem -Path "${repo.currentPath}" | Select-Object Name, FullName, @{Name='Type';Expression={if($_.PSIsContainer){'dir'}else{'file'}}} | ConvertTo-Json`
			]).execute();

			if (response.code === 0) {
				const items = JSON.parse(response.stdout);
				repo.items = items.map((item: any) => ({
					name: item.Name,
					path: item.FullName,
					type: item.Type
				}));
			}
		} catch (error) {
			console.error("Error listing directory:", error);
		}
	};

	const handleItemClick = async (repo: Repository, item: { path: string, type: "file" | "dir" }) => {
		if (item.type === "dir") {
			repo.currentPath = item.path;
			await listDirectory(repo);
		} else {
			// Handle file click - could add file preview functionality here
			console.log("File clicked:", item.path);
		}
	};

	const navigateUp = async (repo: Repository) => {
		if (repo.currentPath) {
			const parentPath = repo.currentPath.split("\\").slice(0, -1).join("\\");
			if (parentPath.startsWith(repo.path)) {
				repo.currentPath = parentPath;
				await listDirectory(repo);
			}
		}
	};

	const runCommand = (command: string) => {
		inputState.value.input = command;
		sendCommand();
	};

	const sendCommand = async () => {
		try {
			const commandName = inputState.value.shellType === "pwsh" ? "exec-pwsh" : "exec-sh";
			const response = await useTauriShellCommand.create(commandName, [
				inputState.value.shellType === "pwsh" ? "-Command" : "-c",
				inputState.value.input!
			]).execute();

			// Format the output to be more readable
			const output = [];
			if (response.stdout) output.push(response.stdout);
			if (response.stderr) output.push(response.stderr);

			outputState.value.output = output.join("\n");

			if (response.code !== 0) {
				outputState.value.output += "\n\nError: Command failed.";
			}
		} catch (error) {
			outputState.value.output = `Error: ${error}`;
		} finally {
			inputState.value.input = undefined;
		}
	};

	const deleteRepo = async (repo: Repository) => {
		try {
			const commandName = "exec-pwsh";
			const response = await useTauriShellCommand.create(commandName, [
				"-Command",
				`Remove-Item -Path "${repo.path}" -Recurse -Force`
			]).execute();

			if (response.code === 0) {
				// Remove from repositories list
				repositories.value = repositories.value.filter((r) => r.path !== repo.path);
				await saveRepositories();
				outputState.value.output = `Repository ${repo.name} deleted successfully.`;
			} else {
				outputState.value.output = `Error deleting repository: ${response.stderr}`;
			}
		} catch (error) {
			outputState.value.output = `Error: ${error}`;
		}
	};
</script>
