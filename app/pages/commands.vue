<template>
	<LayoutTile
		title="Commands"
		description="Access the system shell. Allows you to spawn child processes and manage files and URLs using their default application."
	>
		<div class="space-y-6 md:space-y-8">
			<UForm :state="inputState" :schema="schema" class="flex flex-col gap-y-4 items-end" @submit="sendCommand">
				<div class="flex gap-x-4 w-full">
					<UFormField label="Shell type" name="shellType">
						<select
							v-model="inputState.shellType"
							class="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
						>
							<option value="pwsh">PowerShell</option>
							<option value="sh">Shell</option>
						</select>
					</UFormField>
					<UFormField label="Command input" name="input" class="flex-1">
						<UInput v-model="inputState.input" variant="subtle" size="lg" />
					</UFormField>
				</div>

				<div class="flex gap-x-4 w-full">
					<UButton @click="runCommand('Get-Process')" size="lg" variant="soft">
						List Processes
					</UButton>
					<UButton @click="runCommand('Get-Service')" size="lg" variant="soft">
						List Services
					</UButton>
					<UButton @click="runCommand('Get-NetIPAddress')" size="lg" variant="soft">
						Network Info
					</UButton>
					<UButton type="submit" size="lg">
						Send command
					</UButton>
				</div>
			</UForm>

			<div class="border-t border-gray-200 dark:border-gray-800 pt-6">
				<h3 class="text-lg font-medium mb-4">Git Clone</h3>
				<div class="flex gap-x-4 w-full">
					<UFormField label="Repository URL" name="gitUrl" class="flex-1">
						<UInput v-model="gitUrl" variant="subtle" size="lg" placeholder="https://github.com/username/repo.git" />
					</UFormField>
					<UButton @click="cloneRepo" size="lg" :loading="isCloning">
						Clone Repository
					</UButton>
				</div>
			</div>

			<UForm :state="outputState" class="flex flex-col gap-y-4 items-end">
				<UFormField label="Command output" name="command-output">
					<UTextarea v-model="outputState.output" variant="subtle" size="lg" :rows="8" readonly />
				</UFormField>
			</UForm>
		</div>
	</LayoutTile>
</template>

<script lang="ts" setup>
	definePageMeta({
		name: "Shell commands",
		icon: "lucide:terminal",
		description: "Execute shell commands",
		category: "system"
	});

	const schema = z.object({
		input: z.string({
			required_error: "Input is required"
		}).nonempty(),
		shellType: z.enum(['sh', 'pwsh'], {
			required_error: "Shell type is required"
		})
	});

	type Schema = zInfer<typeof schema>;

	const inputState = ref<Partial<Schema>>({
		input: undefined,
		shellType: 'pwsh'
	});
	const outputState = ref({
		output: ""
	});
	const gitUrl = ref("");
	const isCloning = ref(false);

	const runCommand = (command: string) => {
		inputState.value.input = command;
		sendCommand();
	};

	const cloneRepo = async () => {
		if (!gitUrl.value) {
			outputState.value.output = "Please enter a repository URL";
			return;
		}

		isCloning.value = true;
		try {
			const commandName = 'exec-pwsh';
			const response = await useTauriShellCommand.create(commandName, [
				'-Command',
				`git clone ${gitUrl.value}`
			]).execute();

			// Format the output to be more readable
			const output = [];
			if (response.stdout) output.push(response.stdout);
			if (response.stderr) output.push(response.stderr);
			
			outputState.value.output = output.join('\n');
			
			if (response.code === 0) {
				outputState.value.output += '\n\nRepository cloned successfully!';
			} else {
				outputState.value.output += '\n\nError: Clone operation failed.';
			}
		} catch (error) {
			outputState.value.output = `Error: ${error}`;
		} finally {
			isCloning.value = false;
			gitUrl.value = "";
		}
	};

	const sendCommand = async () => {
		try {
			const commandName = inputState.value.shellType === 'pwsh' ? 'exec-pwsh' : 'exec-sh';
			const response = await useTauriShellCommand.create(commandName, [
				inputState.value.shellType === 'pwsh' ? '-Command' : '-c',
				inputState.value.input!
			]).execute();

			// Format the output to be more readable
			const output = [];
			if (response.stdout) output.push(response.stdout);
			if (response.stderr) output.push(response.stderr);
			
			outputState.value.output = output.join('\n');
			
			if (response.code !== 0) {
				outputState.value.output += '\n\nError: Command failed.';
			}
		} catch (error) {
			outputState.value.output = `Error: ${error}`;
		} finally {
			inputState.value.input = undefined;
		}
	};
</script>
