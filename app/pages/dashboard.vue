<template>
	<div class="flex flex-col items-center justify-center min-h-screen">
		<GlowyCardWrapper>
			<GlowyCard class="p-8 flex flex-col items-center gap-4 w-full max-w-4xl">
				<!-- New Collapsible Content Section -->
				<div class="w-full mb-6">
					<UCard>
						<template #header>
							<div class="flex justify-between items-center w-full cursor-pointer" @click="toggleContentSection">
								<h2 class="text-xl font-bold">Content</h2>
								<UIcon 
									:name="isContentSectionExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" 
									class="transition-transform"
								/>
							</div>
						</template>
						
						<div v-if="isContentSectionExpanded" class="transition-all duration-300">
							<div class="py-4 space-y-4">
								<p class="text-gray-400">
									This section contains your content and recent activities. You can manage your projects, view statistics, and access quick links here.
								</p>
								
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<UCard>
										<div class="flex flex-col items-center p-4">
											<UIcon name="i-heroicons-document-text" class="text-primary text-3xl mb-2" />
											<h3 class="font-semibold mb-1">Projects</h3>
											<p class="text-center text-sm text-gray-400">Manage your projects and view their status</p>
										</div>
									</UCard>
									
									<UCard class="cursor-pointer" @click="openUserPanel">
										<div class="flex flex-col items-center p-4">
											<UIcon name="lucide-user-cog" class="text-primary text-3xl mb-2" />
											<h3 class="font-semibold mb-1">Users</h3>
											<p class="text-center text-sm text-gray-400">View your users panel and add new users</p>
										</div>
									</UCard>
								</div>
							</div>
						</div>
					</UCard>
				</div>
				
				<!-- User Panel Modal -->
				<UserPanel ref="userPanelRef" />
				
				<template v-if="loading">
					<p>Loading...</p>
				</template>
				<template v-else>
					<!-- Local User Profile -->
					<div class="text-center mb-8">
						<h2 class="text-2xl font-bold mb-2">
							{{ currentUser?.username }}
						</h2>
						<p class="text-lg text-gray-500 mb-2">
							{{ currentUser?.email }}
						</p>
					</div>

					<!-- GitHub Section -->
					<div v-if="githubUser" class="w-full">
						<div class="flex justify-between items-center mb-4">
							<h3 class="text-xl font-bold">GitHub Profile</h3>
							<UButton
								color="error"
								variant="soft"
								@click="handleGitHubLogout"
							>
								Disconnect GitHub
							</UButton>
						</div>
						<div class="flex items-center gap-4 mb-8">
							<img :src="githubUser.avatar_url" :alt="githubUser.name || githubUser.login" class="rounded-full w-32 h-32 border-4 border-primary">
							<div>
								<h2 class="text-2xl font-bold mb-2">
									{{ githubUser.name || githubUser.login }}
								</h2>
								<p class="text-lg text-gray-500 mb-2">
									@{{ githubUser.login }}
								</p>
								<p v-if="githubUser.bio" class="text-md text-gray-400">
									{{ githubUser.bio }}
								</p>
								<a :href="githubUser.html_url" target="_blank" class="text-primary underline">View on GitHub</a>
							</div>
						</div>

						<!-- Repository Section -->
						<div class="flex flex-col gap-4 mt-8 mb-4 w-full">
							<!-- Search and View Controls -->
							<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
								<!-- Search Input -->
								<div class="w-full sm:w-96">
									<UInput
										v-model="searchQuery"
										placeholder="Search repositories..."
										icon="i-heroicons-magnifying-glass"
										clearable
										class="w-full bg-neutral border-primary"
									/>
								</div>
								<!-- View Controls -->
								<div class="flex gap-2 items-center">
									<UButton :class="{ 'font-bold underline': displayMode === 'list', 'text-white': displayMode !== 'list' }" @click="setDisplayMode('list')">
										List
									</UButton>
									<UButton :class="{ 'font-bold underline': displayMode === 'grid', 'text-white': displayMode !== 'grid' }" @click="setDisplayMode('grid')">
										Grid
									</UButton>
									<UButton :class="{ 'font-bold underline': displayMode === 'table', 'text-white': displayMode !== 'table' }" @click="setDisplayMode('table')">
										Table
									</UButton>
								</div>
							</div>
							<!-- Grid Size Controls -->
							<div v-if="displayMode === 'grid'" class="flex gap-2 items-center">
								<span>Grid size:</span>
								<button v-for="n in [2, 3, 4]" :key="n" class="rounded px-2 py-1 transition" :class="{ 'font-bold underline bg-primary text-white': gridSize === n, 'bg-gray-800 text-gray-300': gridSize !== n }" @click="() => setGridSize(n)">
									{{ n }}
								</button>
							</div>
						</div>

						<!-- Repository Display -->
						<div v-if="filteredRepos.length" class="w-full">
							<!-- Table mode -->
							<div v-if="displayMode === 'table'" class="w-full mt-4">
								<!-- Mobile/Tablet View -->
								<div class="block lg:hidden">
									<div v-for="(repo, index) in sortedRepos" :key="repo.id" class="bg-neutral rounded-xl p-4 mb-4 relative">
										<div class="flex justify-between items-start mb-2">
											<a :href="repo.html_url" target="_blank" class="text-primary hover:underline font-semibold">{{ repo.name }}</a>
											<button class="text-gray-400 hover:text-white" @click="toggleRepoDetails(repo.id)">
												<UIcon :name="expandedRepos.includes(repo.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
											</button>
										</div>
										<div v-if="expandedRepos.includes(repo.id)" class="space-y-2 mt-2">
											<div class="flex items-center gap-2">
												<span class="text-gray-400">Language:</span>
												<UBadge v-if="repo.language" color="primary" variant="soft">
													{{ repo.language }}
												</UBadge>
												<span v-else class="text-gray-500">-</span>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-gray-400">Stars:</span>
												<UBadge color="primary" variant="soft">
													<UIcon name="i-heroicons-star" class="mr-1" />
													{{ repo.stargazers_count }}
												</UBadge>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-gray-400">Forks:</span>
												<UBadge color="neutral" variant="soft">
													<UIcon name="i-heroicons-code-bracket-square" class="mr-1" />
													{{ repo.forks_count }}
												</UBadge>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-gray-400">Last Updated:</span>
												<span class="text-gray-300">{{ formatDate(repo.updated_at) }}</span>
											</div>
										</div>
										<div v-if="index < sortedRepos.length - 1" class="absolute bottom-0 left-0 right-0 h-px bg-primary/20" />
									</div>
								</div>

								<!-- Desktop View -->
								<div class="hidden lg:block overflow-x-auto">
									<table class="w-full border-collapse min-w-[800px]">
										<thead class="sticky top-0 z-10">
											<tr class="bg-neutral border-b border-primary/20">
												<th class="p-3 text-left cursor-pointer hover:bg-gray-800 whitespace-nowrap" @click="sortBy('name')">
													Name
													<UIcon v-if="sortKey === 'name'" :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="ml-1" />
												</th>
												<th class="p-3 text-left cursor-pointer hover:bg-gray-800 whitespace-nowrap" @click="sortBy('language')">
													Language
													<UIcon v-if="sortKey === 'language'" :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="ml-1" />
												</th>
												<th class="p-3 text-left cursor-pointer hover:bg-gray-800 whitespace-nowrap" @click="sortBy('stargazers_count')">
													Stars
													<UIcon v-if="sortKey === 'stargazers_count'" :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="ml-1" />
												</th>
												<th class="p-3 text-left cursor-pointer hover:bg-gray-800 whitespace-nowrap" @click="sortBy('forks_count')">
													Forks
													<UIcon v-if="sortKey === 'forks_count'" :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="ml-1" />
												</th>
												<th class="p-3 text-left cursor-pointer hover:bg-gray-800 whitespace-nowrap" @click="sortBy('updated_at')">
													Last Updated
													<UIcon v-if="sortKey === 'updated_at'" :name="sortOrder === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="ml-1" />
												</th>
											</tr>
										</thead>
										<tbody>
											<tr v-for="repo in sortedRepos" :key="repo.id" class="border-b border-primary/20 hover:bg-gray-900 transition">
												<td class="p-3 whitespace-nowrap">
													<a :href="repo.html_url" target="_blank" class="text-primary hover:underline">{{ repo.name }}</a>
												</td>
												<td class="p-3 whitespace-nowrap">
													<UBadge v-if="repo.language" color="primary" variant="soft">
														{{ repo.language }}
													</UBadge>
													<span v-else class="text-gray-500">-</span>
												</td>
												<td class="p-3 whitespace-nowrap">
													<UBadge color="primary" variant="soft">
														<UIcon name="i-heroicons-star" class="mr-1" />
														{{ repo.stargazers_count }}
													</UBadge>
												</td>
												<td class="p-3 whitespace-nowrap">
													<UBadge color="neutral" variant="soft">
														<UIcon name="i-heroicons-code-bracket-square" class="mr-1" />
														{{ repo.forks_count }}
													</UBadge>
												</td>
												<td class="p-3 text-gray-400 whitespace-nowrap">
													{{ formatDate(repo.updated_at) }}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
							<!-- Grid mode -->
							<div v-else-if="displayMode === 'grid'" :class="`grid gap-6 mt-4 grid-cols-1 sm:grid-cols-${gridSize}`">
								<div v-for="repo in sortedRepos" :key="repo.id" class="bg-neutral rounded-xl p-5 shadow border border-primary flex flex-col hover:scale-[1.02] transition-transform">
									<a :href="repo.html_url" target="_blank" class="text-primary font-bold text-lg mb-1 hover:underline">{{ repo.name }}</a>
									<span v-if="repo.description" class="text-gray-400 mb-2">{{ repo.description }}</span>
									<div class="flex flex-wrap gap-2 text-xs text-gray-500 mt-auto pt-2">
										<UBadge v-if="repo.language" color="primary" variant="soft">
											{{ repo.language }}
										</UBadge>
										<UBadge color="primary" variant="soft">
											<UIcon name="i-heroicons-star" class="mr-1" />
											{{ repo.stargazers_count }}
										</UBadge>
										<UBadge color="neutral" variant="soft">
											<UIcon name="i-heroicons-code-bracket-square" class="mr-1" />
											{{ repo.forks_count }}
										</UBadge>
									</div>
								</div>
							</div>
							<!-- List mode -->
							<ul v-else class="w-full mt-4 divide-y divide-primary bg-neutral rounded-xl overflow-hidden">
								<li v-for="repo in sortedRepos" :key="repo.id" class="py-4 px-3 flex flex-col sm:flex-row sm:items-center sm:gap-2 hover:bg-gray-900 transition">
									<a :href="repo.html_url" target="_blank" class="text-primary underline font-semibold text-lg hover:text-orange-400">
										{{ repo.name }}
									</a>
									<span v-if="repo.description" class="text-gray-400 ml-0 sm:ml-2 block sm:inline">- {{ repo.description }}</span>
									<UBadge v-if="repo.language" color="primary" variant="soft" class="ml-0 sm:ml-2">
										{{ repo.language }}
									</UBadge>
									<UBadge color="primary" variant="soft" class="ml-0 sm:ml-2">
										<UIcon name="i-heroicons-star" class="mr-1" />
										{{ repo.stargazers_count }}
									</UBadge>
									<UBadge color="neutral" variant="soft" class="ml-0 sm:ml-2">
										<UIcon name="i-heroicons-code-bracket-square" class="mr-1" />
										{{ repo.forks_count }}
									</UBadge>
								</li>
							</ul>

							<!-- Loading indicator -->
							<div v-if="loadingMore" class="flex justify-center items-center py-4">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
							</div>

							<!-- Intersection observer target -->
							<div ref="loadMoreTrigger" class="h-4 w-full" />
						</div>
						<div v-else class="mt-8 text-gray-400">
							No repositories found.
						</div>
					</div>
					<div v-else class="text-center">
						<h3 class="text-xl font-bold mb-4">Connect with GitHub</h3>
						<p class="text-gray-400 mb-4">Connect your GitHub account to view your repositories and profile information.</p>
						<UButton
							color="primary"
							icon="i-lucide-github"
							@click="handleGitHubLogin"
						>
							Connect with GitHub
						</UButton>
					</div>
				</template>
			</GlowyCard>
		</GlowyCardWrapper>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
	import { useRouter } from "vue-router";
	import GlowyCard from "@/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "@/components/stunning/GlowyCardWrapper.vue";
	import UserPanel from "~/components/UserPanel.vue";
	import { useAuth } from "~/composables/useAuth";
	import { useCurrentUser } from "~/composables/useCurrentUser";
	import { useTauriNotificationSendNotification } from "#imports";
	import { z } from 'zod';

	type DisplayMode = "list" | "grid" | "table";
	type SortKey = "name" | "language" | "stargazers_count" | "forks_count" | "updated_at";
	type SortOrder = "asc" | "desc";

	interface GithubUser {
		login: string
		name?: string
		avatar_url: string
		html_url: string
		bio?: string
	}

	const router = useRouter();
	const { isAuthenticated, user, fetchRepos, login: githubLogin, logout: githubLogout } = useAuth();
	const { user: currentUser } = useCurrentUser();
	const loading = ref(true);
	const repos = ref<any[]>([]);
	const page = ref(1);
	const perPage = ref(100);
	const loadingMore = ref(false);
	const allLoaded = ref(false);
	const loadMoreTrigger = ref<HTMLElement | null>(null);
	let observer: IntersectionObserver | null = null;
	const searchQuery = ref("");
	const searchTimeout = ref<NodeJS.Timeout | null>(null);
	
	// Content section state
	const isContentSectionExpanded = ref(true);
	
	// User panel modal state
	const userPanelRef = ref();

	function toggleContentSection() {
		isContentSectionExpanded.value = !isContentSectionExpanded.value;
	}

	// Display options
	const displayMode = ref<DisplayMode>("list");
	const gridSize = ref(3);

	// Sorting
	const sortKey = ref<SortKey>("name");
	const sortOrder = ref<SortOrder>("asc");

	const handleGitHubLogin = async () => {
		try {
			if (!githubLogin) {
				throw new Error('GitHub login function is not available');
			}
			await githubLogin();
		} catch (error) {
			console.error("Error authenticating with GitHub:", error);
			// Use Tauri notification
			useTauriNotificationSendNotification({
				title: 'Error',
				body: error instanceof Error ? error.message : 'Failed to authenticate with GitHub'
			});
		}
	};

	const handleGitHubLogout = async () => {
		githubLogout();
		if (currentUser.value) {
			const userStore = await useUserStore();
			await userStore.updateUser(currentUser.value.email, {
				isGithubConnected: false,
				githubToken: undefined
			});
			currentUser.value = {
				...currentUser.value,
				isGithubConnected: false,
				githubToken: undefined
			};
			localStorage.setItem('currentUser', JSON.stringify(currentUser.value));
			// Show success notification
			useTauriNotificationSendNotification({
				title: 'Success',
				body: 'Successfully disconnected from GitHub'
			});
		}
	};

	// Filtered and sorted repositories
	const filteredRepos = computed(() => {
		let filtered = repos.value;

		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((repo) =>
				repo.name.toLowerCase().includes(query)
				|| (repo.description && repo.description.toLowerCase().includes(query))
				|| (repo.language && repo.language.toLowerCase().includes(query))
			);

			// If we have a search query and less than 10 results, trigger loading more
			if (filtered.length < 10 && !allLoaded.value && !loadingMore.value) {
				loadRepos();
			}
		}

		return filtered.sort((a, b) => {
			let aValue = a[sortKey.value];
			let bValue = b[sortKey.value];

			if (!aValue) aValue = "";
			if (!bValue) bValue = "";

			if (sortKey.value === "updated_at") {
				return sortOrder.value === "asc"
					? new Date(aValue).getTime() - new Date(bValue).getTime()
					: new Date(bValue).getTime() - new Date(aValue).getTime();
			}

			if (sortKey.value === "stargazers_count" || sortKey.value === "forks_count") {
				return sortOrder.value === "asc" ? aValue - bValue : bValue - aValue;
			}

			return sortOrder.value === "asc"
				? aValue.toString().localeCompare(bValue.toString())
				: bValue.toString().localeCompare(aValue.toString());
		});
	});

	// Replace sortedRepos with filteredRepos in the template
	const sortedRepos = filteredRepos;

	// Watch for search query changes
	watch(searchQuery, (newQuery) => {
		// Clear any existing timeout
		if (searchTimeout.value) {
			clearTimeout(searchTimeout.value);
		}

		// Reset pagination and repositories
		page.value = 1;
		allLoaded.value = false;
		repos.value = [];

		// Add a small delay before loading to prevent rapid API calls
		searchTimeout.value = setTimeout(() => {
			loadRepos(true);
		}, 300);
	});

	function sortBy(key: SortKey) {
		if (sortKey.value === key) {
			sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
		} else {
			sortKey.value = key;
			sortOrder.value = "asc";
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	}

	console.log("user.value:", user.value);

	watchEffect(() => {
		if (!currentUser.value) {
			router.replace("/");
		} else {
			loading.value = false;
			// Only load repos if we haven't loaded them yet and user is authenticated
			if (currentUser.value.isGithubConnected && isAuthenticated.value && repos.value.length === 0) {
				loadRepos(true);
				setupInfiniteScroll();
			}
		}
	});

	const githubUser = computed(() => user.value as GithubUser | null);

	async function loadRepos(reset = false) {
		if (reset) {
			repos.value = [];
			page.value = 1;
			allLoaded.value = false;
		}
		if (allLoaded.value || loadingMore.value) return;

		loadingMore.value = true;
		try {
			const newRepos = await fetchRepos(page.value, perPage.value);
			
			// Check if we got any repos
			if (!newRepos || newRepos.length === 0) {
				allLoaded.value = true;
			} else {
				// Add new repos to the list
				repos.value = reset ? newRepos : [...repos.value, ...newRepos];
				
				// If we got less than requested, we've reached the end
				if (newRepos.length < perPage.value) {
					allLoaded.value = true;
				} else {
					// Increment page for next load
					page.value++;
					// Automatically trigger next load if we're not at the end
					setTimeout(() => {
						loadRepos();
					}, 500);
				}
			}
		} catch (error) {
			console.error("Error loading repositories:", error);
			useTauriNotificationSendNotification({
				title: "Error",
				body: "Failed to load more repositories"
			});
		} finally {
			loadingMore.value = false;
		}
	}

	// Setup intersection observer for infinite scroll
	function setupInfiniteScroll() {
		if (!loadMoreTrigger.value) return;

		if (observer) {
			observer.disconnect();
		}

		observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target?.isIntersecting && !loadingMore.value && !allLoaded.value) {
					loadRepos();
				}
			},
			{
				root: null,
				rootMargin: "500px", // Increased to start loading much earlier
				threshold: 0.1
			}
		);

		observer.observe(loadMoreTrigger.value);
	}

	// Initial load
	onMounted(async () => {
		if (isAuthenticated.value && repos.value.length === 0) {
			await loadRepos(true);
			setupInfiniteScroll();
		}
	});

	// Cleanup
	onUnmounted(() => {
		if (observer) {
			observer.disconnect();
		}
		if (searchTimeout.value) {
			clearTimeout(searchTimeout.value);
		}
	});

	function setDisplayMode(mode: DisplayMode) {
		displayMode.value = mode;
	}
	function setGridSize(size: number) {
		gridSize.value = size;
	}

	const expandedRepos = ref<number[]>([]);

	function toggleRepoDetails(repoId: number) {
		const index = expandedRepos.value.indexOf(repoId);
		if (index === -1) {
			expandedRepos.value.push(repoId);
		} else {
			expandedRepos.value.splice(index, 1);
		}
	}

	function openUserPanel() {
		if (userPanelRef.value) {
			userPanelRef.value.open = true;
		}
	}
</script>

<style scoped>
.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
