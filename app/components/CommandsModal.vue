<template>
  <UModal v-model:open="open" title="Shell Commands" :ui="{ footer: 'justify-end' }">
    <template #body>
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

        <div v-if="repositories.length > 0" class="border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 class="text-lg font-medium mb-4">Repositories</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="repo in repositories" :key="repo.path" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h4 class="font-medium">{{ repo.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ repo.url }}</p>
                </div>
                <UButton
                  icon="i-lucide-folder-open"
                  color="neutral"
                  variant="ghost"
                  @click="exploreRepo(repo)"
                />
              </div>
              <div v-if="repo.exploring" class="mt-4">
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
                    @click="navigateUp(repo)"
                    :disabled="repo.currentPath === repo.path"
                  />
                </div>
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-for="item in repo.items"
                    :key="item.path"
                    class="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                    @click="handleItemClick(repo, item)"
                  >
                    <UIcon
                      :name="item.type === 'dir' ? 'i-lucide-folder' : 'i-lucide-file'"
                      class="text-gray-500"
                    />
                    <span class="text-sm">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UForm :state="outputState" class="flex flex-col gap-y-4 items-end">
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
import { ref } from 'vue';
// All logic from commands.vue below

const open = ref(false);

defineExpose({ open });

// ... rest of the script from commands.vue (except definePageMeta and LayoutTile) ...

interface Repository {
  name: string;
  url: string;
  path: string;
  exploring?: boolean;
  currentPath?: string;
  items?: Array<{
    name: string;
    path: string;
    type: 'file' | 'dir';
  }>;
}

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
const repositories = ref<Repository[]>([]);

// Initialize store for repositories
const store = await useTauriStoreLoad("repositories.bin", {
  autoSave: true
});

// Load saved repositories
const loadRepositories = async () => {
  try {
    const savedRepos = await store.get<Repository[]>("repositories") || [];
    repositories.value = savedRepos;
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
      
      // Extract repository name from URL
      const repoName = gitUrl.value.split('/').pop()?.replace('.git', '') || '';
      
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
      outputState.value.output += '\n\nError: Clone operation failed.';
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
  }
};

const listDirectory = async (repo: Repository) => {
  try {
    const commandName = 'exec-pwsh';
    const response = await useTauriShellCommand.create(commandName, [
      '-Command',
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

const handleItemClick = async (repo: Repository, item: { path: string; type: 'file' | 'dir' }) => {
  if (item.type === 'dir') {
    repo.currentPath = item.path;
    await listDirectory(repo);
  } else {
    // Handle file click - could add file preview functionality here
    console.log("File clicked:", item.path);
  }
};

const navigateUp = async (repo: Repository) => {
  if (repo.currentPath) {
    const parentPath = repo.currentPath.split('\\').slice(0, -1).join('\\');
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