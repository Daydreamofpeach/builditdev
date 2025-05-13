<template>
	<!-- User Info & Account Details Section (outside GlowyCard) -->
	<section class="w-full max-w-4xl mx-auto mt-8 mb-6 px-4">
		<!-- User Info -->
		<div class="text-center mb-6">
			<h2 class="text-2xl font-bold mb-2">{{ currentUser?.username }}</h2>
			<p class="text-lg text-gray-500 mb-2">{{ currentUser?.email }}</p>
		</div>
		<OsInfo class="mb-6" />
		<!-- Account Details Collapsible -->
		<UCard>
			<template #header>
				<div class="flex justify-between items-center cursor-pointer" @click="isAccountSectionExpanded = !isAccountSectionExpanded">
					<UIcon name="i-lucide-user-pen" class="text-primary text-3xl mb-2" />	<h3 class="font-bold">Account & Password</h3>
					<UIcon :name="isAccountSectionExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
				</div>
			</template>
			<div v-if="isAccountSectionExpanded" class="transition-all duration-300">
				<UTabs :items="accountTabs" class="w-full">
					<template #account>
						<div class="space-y-4">
						
							<GlowyCardWrapper>
								<GlowyCard>
									<UForm :state="profileState" :schema="profileSchema" class="flex flex-col gap-y-4" @submit="setProfileData">
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
											<UFormField label="Name" name="name">
												<UInput v-model="profileState.name" variant="subtle" size="lg" />
											</UFormField>
											<UFormField label="Email" name="email">
												<UInput v-model="profileState.email" variant="subtle" size="lg" />
											</UFormField>
											<UFormField label="Phone" name="phone">
												<UInput v-model="profileState.phone" variant="subtle" size="lg" />
											</UFormField>
											<UFormField label="Address" name="address">
												<UInput v-model="profileState.address" variant="subtle" size="lg" />
											</UFormField>
										</div>
										<UButton type="submit" size="lg" class="self-end">Save Profile</UButton>
									</UForm>
								</GlowyCard>
							</GlowyCardWrapper>
							<GlowyCardWrapper>
								<GlowyCard>
									<UForm :state="profileOutputState" class="flex flex-col gap-y-4">
										<UFormField label="Stored Profile Data" name="profileContent">
											<UTextarea v-model="profileOutputState.content" variant="subtle" size="lg" :rows="4" readonly />
										</UFormField>
									</UForm>
								</GlowyCard>
							</GlowyCardWrapper>
						</div>
					</template>
					<template #password>
						<div class="space-y-4">
							<h2 class="text-xl font-semibold mb-4">Change Password</h2>
							<GlowyCardWrapper>
								<GlowyCard>
									<UForm :state="passwordState" :schema="passwordSchema" class="flex flex-col gap-y-4" @submit="setPasswordData">
										<UFormField label="Current Password" name="currentPassword">
											<UInput v-model="passwordState.currentPassword" type="password" variant="subtle" size="lg" />
										</UFormField>
										<UFormField label="New Password" name="newPassword">
											<UInput v-model="passwordState.newPassword" type="password" variant="subtle" size="lg" />
										</UFormField>
										<UFormField label="Confirm New Password" name="confirmPassword">
											<UInput v-model="passwordState.confirmPassword" type="password" variant="subtle" size="lg" />
										</UFormField>
										<UButton type="submit" size="lg" class="self-end">Update Password</UButton>
									</UForm>
								</GlowyCard>
							</GlowyCardWrapper>
							<GlowyCardWrapper>
								<GlowyCard>
									<UForm :state="passwordOutputState" class="flex flex-col justify-center gap-y-4">
										<UFormField label="Stored Password Data" name="passwordContent">
											<UTextarea v-model="passwordOutputState.content" variant="subtle" size="lg" :rows="4" readonly />
										</UFormField>
									</UForm>
								</GlowyCard>
							</GlowyCardWrapper>
						</div>
					</template>
				</UTabs>
			</div>
		</UCard>
	</section>

	<!-- Shell Commands Collapsible Section -->
	<section class="w-full max-w-4xl mx-auto mb-6 px-4">
		<UCard>
			<template #header>
				<div class="flex justify-between items-center cursor-pointer" @click="isCommandsSectionExpanded = !isCommandsSectionExpanded">
													<UIcon name="i-lucide-square-terminal	" class="text-primary text-3xl mb-2" />
					<h3 class="font-semibold">Shell Commands</h3>
					<UIcon :name="isCommandsSectionExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
				</div>
			</template>
			<div v-if="isCommandsSectionExpanded" class="transition-all duration-300">
				<div class="flex flex-col items-center py-4">
					<UButton color="primary" icon="i-lucide-terminal" @click="openCommandsModal">
						Open Shell Commands
					</UButton>
				</div>
				<div v-if="repositoriesList.length" class="w-full mt-4">
					<h4 class="font-semibold mb-2">Cloned Repositories</h4>
					<ul class="divide-y divide-primary">
						<li v-for="repo in repositoriesList" :key="repo.path" class="py-2 flex flex-col">
							<span class="font-bold text-primary truncate break-all max-w-full">{{ repo.name }}</span>
							<span class="text-gray-400 ml-2 truncate break-all max-w-full">{{ repo.url }}</span>
						</li>
					</ul>
				</div>
			</div>
		</UCard>
	</section>

	<!-- Main Dashboard Card -->
	<div class="w-full max-w-4xl mx-auto">
		<GlowyCardWrapper>
			<GlowyCard class="p-8 flex flex-col items-center gap-4 w-full">
				<!-- New Collapsible Content Section -->
				<div class="w-full mb-6">
					<UCard>
						<template #header>
							<div class="flex justify-between items-center w-full cursor-pointer" @click="toggleContentSection">
								<UIcon name="i-lucide-hammer" class="text-primary text-3xl mb-2" /><h3 class=" font-bold">Management</h3>
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
									<!-- Organizations Card and List -->
									<div>
										<UCard class="cursor-pointer" @click="openOrganizationPanel">
											<div class="flex flex-col items-center p-4">
												<UIcon name="i-lucide-building" class="text-primary text-3xl mb-2" />
												<h3 class="font-semibold mb-1">Organizations +</h3>
												<p class="text-center text-sm text-gray-400">Manage organizations and view their status</p>
											</div>
										</UCard>
										<!-- Organizations List Section -->
										<UCard class="mt-2">
											<template #header>
												<div class="flex justify-between items-center cursor-pointer" @click="isOrganizationsListExpanded = !isOrganizationsListExpanded">
													<h4 class="font-semibold">Organizations List</h4>
													<UIcon :name="isOrganizationsListExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
												</div>
											</template>
											<div v-if="isOrganizationsListExpanded" class="transition-all duration-300">
												<ul class="divide-y divide-primary">
													<li v-for="org in organizationsList" :key="org.name" class="py-2 flex flex-col">
														<span class="font-bold text-primary truncate break-all max-w-full">{{ org.name }}</span>
														<span class="text-gray-400 ml-2 truncate break-all max-w-full">{{ org.description }}</span>
													</li>
													<li v-if="organizationsList.length === 0" class="text-gray-400 py-2">No organizations found.</li>
												</ul>
											</div>
										</UCard>
									</div>
									<!-- Users Card and List -->
									<div>
										<UCard class="cursor-pointer" @click="openUserPanel">
											<div class="flex flex-col items-center p-4">
												<UIcon name="lucide-user-round-plus" class="text-primary text-3xl mb-2" />
												<h3 class="font-semibold mb-1">Users +</h3>
												<p class="text-center text-sm text-gray-400">View your users panel and add new users</p>
											</div>
										</UCard>
										<!-- Users List Section -->
										<UCard class="mt-2">
											<template #header>
												<div class="flex justify-between items-center cursor-pointer" @click="isUsersListExpanded = !isUsersListExpanded">
													<h4 class="font-semibold">Users List</h4>
													<UIcon :name="isUsersListExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" />
												</div>
											</template>
											<div v-if="isUsersListExpanded" class="transition-all duration-300">
												<ul class="divide-y divide-primary">
													<li v-for="user in usersList" :key="user.username" class="py-2 flex flex-col">
														<span class="font-bold text-primary truncate break-all max-w-full">{{ user.username }}</span>
														<span class="text-gray-400 ml-2 truncate break-all max-w-full">{{ user.email }}</span>
													</li>
													<li v-if="usersList.length === 0" class="text-gray-400 py-2">No users found.</li>
												</ul>
											</div>
										</UCard>
									</div>
								</div>
								<!-- New row for Templates and Components -->
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
									<!-- Templates Card -->
									<UCard class="cursor-pointer">
										<div class="flex flex-col items-center p-4">
											<UIcon name="i-lucide-layout-template" class="text-primary text-3xl mb-2" />
											<h3 class="font-semibold mb-1">Templates +</h3>
											<p class="text-center text-sm text-gray-400">Manage and browse your templates</p>
										</div>
									</UCard>
									<!-- Components Card -->
									<UCard class="cursor-pointer">
										<div class="flex flex-col items-center p-4">
											<UIcon name="i-lucide-component" class="text-primary text-3xl mb-2" />
											<h3 class="font-semibold mb-1">Components +</h3>
											<p class="text-center text-sm text-gray-400">Manage and browse your components</p>
										</div>
									</UCard>
								</div>
							</div>
						</div>
					</UCard>
				</div>
				
				<!-- User Panel Modal -->
				<UserPanel ref="userPanelRef" :open="userPanelOpen" @update:open="userPanelOpen = $event" @updated="fetchUsersList" />
				
				<!-- Organization Panel Modal -->
				<OrganizationPanel ref="organizationPanelRef" :open="organizationPanelOpen" @update:open="organizationPanelOpen = $event" @updated="fetchOrganizationsList" />
				
				<!-- Commands Modal -->
				<CommandsModal ref="commandsModalRef" />
				
				<template v-if="loading">
					<p>Loading...</p>
				</template>
				<template v-else>
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
						<div class="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-8 w-full">
							<img :src="githubUser.avatar_url" :alt="githubUser.name || githubUser.login" class="rounded-full w-32 h-32 border-4 border-primary mx-auto lg:mx-0" />
							<div class="flex-1 w-full text-center lg:text-left">
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
	import { computed, onMounted, onUnmounted, ref, watch, watchEffect, nextTick } from "vue";
	import { useRouter } from "vue-router";
	import GlowyCard from "@/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "@/components/stunning/GlowyCardWrapper.vue";
	import UserPanel from "~/components/UserPanel.vue";
	import OrganizationPanel from "~/components/OrganizationPanel.vue";
	import CommandsModal from '~/components/CommandsModal.vue';
	import { useAuth } from '~/composables/useAuth';
	import { useAuthState } from '~/composables/useAuthState';
	import { useTauriNotificationSendNotification, useTauriStoreLoad } from "#imports";
	import { z } from 'zod';
	import OsInfo from '~/components/OsInfo.vue';
	import { useCurrentUser } from '~/composables/useCurrentUser';

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

	interface RepositoryInfo {
		name: string;
		url: string;
		path?: string;
	}

	const router = useRouter();
	const { currentUser, isLoggedIn, logout: appLogout, login: appLogin } = useAuthState();
	const { isAuthenticated, user: githubUser, fetchRepos, login: githubLogin, logout: githubLogout } = useAuth();
	const { user: currentUserFromCurrentUser } = useCurrentUser();
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

	// Organization panel modal state
	const organizationPanelRef = ref();

	// Under the Users and Organizations cards, add collapsible lists
	const isUsersListExpanded = ref(false);
	const isOrganizationsListExpanded = ref(false);
	const usersList = ref<any[]>([]);
	const organizationsList = ref<any[]>([]);

	// Add after the user profile info, before the GitHub section
	const isAccountSectionExpanded = ref(false);
	const accountTabs = [
		{ label: 'Account', icon: 'i-lucide-user', slot: 'account' },
		{ label: 'Password', icon: 'i-lucide-lock', slot: 'password' }
	];
	const profileSchema = z.object({
		name: z.string().optional(),
		email: z.string().email().optional(),
		phone: z.string().optional(),
		address: z.string().optional()
	});
	const passwordSchema = z.object({
		currentPassword: z.string().min(8),
		newPassword: z.string().min(8),
		confirmPassword: z.string().min(8)
	}).refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"]
	});
	const profileState = ref({
		name: currentUser.value?.username || '',
		email: currentUser.value?.email || '',
		phone: currentUser.value?.phone || '',
		address: currentUser.value?.address || ''
	});
	const passwordState = ref({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	const profileOutputState = ref({ content: '' });
	const passwordOutputState = ref({ content: '' });

	// Add modal ref
	const commandsModalRef = ref();
	// Add collapsible state
	const isCommandsSectionExpanded = ref(false);
	const repositoriesList = ref<RepositoryInfo[]>([]);

	// New refs for user and organization panels
	const userPanelOpen = ref(false);
	const organizationPanelOpen = ref(false);

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
			await githubLogin();
			if (githubUser.value) {
				appLogin({
					username: githubUser.value.login,
					email: githubUser.value.email,
					isGithubConnected: true,
					githubToken: localStorage.getItem('gh_token') || undefined
				});
			}
		} catch (error) {
			console.error('Error authenticating with GitHub:', error);
			useTauriNotificationSendNotification({
				title: 'Error',
				body: error instanceof Error ? error.message : 'Failed to authenticate with GitHub'
			});
		}
	};

	const handleGitHubLogout = async () => {
		appLogout();
		githubLogout();
		if (currentUser.value) {
			const userStore = await useTauriStoreLoad("users.bin", { autoSave: true });
			await userStore.set(currentUser.value.email, JSON.stringify({
				isGithubConnected: false,
				githubToken: undefined
			}));
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

	console.log("user.value:", currentUser.value);

	watchEffect(() => {
		if (!currentUser.value) {
			router.replace("/");
		} else {
			loading.value = false;
			// Only load repos if we haven't loaded them yet and user is authenticated
			if (currentUser.value.isGithubConnected && isLoggedIn && repos.value.length === 0) {
				loadRepos(true);
				setupInfiniteScroll();
			}
		}
	});

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
		if (isLoggedIn && repos.value.length === 0) {
			await loadRepos(true);
			setupInfiniteScroll();
		}
		await Promise.all([fetchUsersList(), fetchOrganizationsList()]);
		await loadProfileData();
		fetchRepositoriesList();
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
		if (userPanelRef.value && typeof userPanelRef.value.resetForm === 'function') {
			userPanelRef.value.resetForm();
		}
		userPanelOpen.value = true;
		console.log('UserPanel ref:', userPanelRef.value);
	}
	function closeUserPanel() {
		userPanelOpen.value = false;
	}

	function openOrganizationPanel() {
		if (organizationPanelRef.value && typeof organizationPanelRef.value.resetForm === 'function') {
			organizationPanelRef.value.resetForm();
		}
		organizationPanelOpen.value = true;
		console.log('OrganizationPanel ref:', organizationPanelRef.value);
	}
	function closeOrganizationPanel() {
		organizationPanelOpen.value = false;
	}

	async function fetchUsersList() {
		try {
			const store = await useTauriStoreLoad("users.bin", { autoSave: false });
			const entries = await store.entries();
			usersList.value = entries
				.filter(([key]) => key.startsWith("user_"))
				.map(([_, value]) => {
					try {
						const user = JSON.parse(value as string);
						return {
							username: user.username,
							email: user.email
						};
					} catch {
						return null;
					}
				})
				.filter(Boolean);
		} catch (e) {
			usersList.value = [];
		}
	}

	async function fetchOrganizationsList() {
		try {
			const store = await useTauriStoreLoad("organizations.bin", { autoSave: false });
			const entries = await store.entries();
			organizationsList.value = entries
				.filter(([key]) => key.startsWith("org_"))
				.map(([_, value]) => {
					try {
						const org = JSON.parse(value as string);
						return {
							name: org.name,
							description: org.description
						};
					} catch {
						return null;
					}
				})
				.filter(Boolean);
		} catch (e) {
			organizationsList.value = [];
		}
	}

	async function loadProfileData() {
		if (!currentUser.value?.email) return;
		
		profileState.value = {
			name: currentUser.value.username,
			email: currentUser.value.email,
			phone: currentUser.value.phone || '',
			address: currentUser.value.address || ''
		};
		profileOutputState.value.content = JSON.stringify(profileState.value, null, 2);
	}

	async function setProfileData() {
		try {
			const success = await updateProfile({
				username: profileState.value.name,
				email: profileState.value.email,
				phone: profileState.value.phone,
				address: profileState.value.address
			});

			if (success) {
				profileOutputState.value.content = JSON.stringify(profileState.value, null, 2);
				useTauriNotificationSendNotification({ title: 'Success', body: 'Profile data saved successfully' });
			} else {
				useTauriNotificationSendNotification({ title: 'Error', body: userError.value || 'Failed to save profile data' });
			}
		} catch (e) {
			useTauriNotificationSendNotification({ title: 'Error', body: 'Failed to save profile data' });
		}
	}

	async function setPasswordData() {
		try {
			if (passwordState.value.newPassword !== passwordState.value.confirmPassword) {
				useTauriNotificationSendNotification({ title: 'Error', body: "Passwords don't match" });
				return;
			}

			const success = await updatePassword(
				passwordState.value.currentPassword,
				passwordState.value.newPassword
			);

			if (success) {
				passwordOutputState.value.content = JSON.stringify({ ...passwordState.value, password: undefined }, null, 2);
				useTauriNotificationSendNotification({ title: 'Success', body: 'Password updated successfully' });
				passwordState.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
			} else {
				useTauriNotificationSendNotification({ title: 'Error', body: userError.value || 'Failed to update password' });
			}
		} catch (e) {
			useTauriNotificationSendNotification({ title: 'Error', body: 'Failed to update password' });
		}
	}

	// Add a watcher for currentUser changes
	watch(
		() => currentUser.value?.email,
		async (newEmail, oldEmail) => {
			if (newEmail && newEmail !== oldEmail) {
				await loadProfileData();
			}
		}
	);

	function openCommandsModal() {
		if (commandsModalRef.value && typeof commandsModalRef.value.open !== 'undefined') {
			commandsModalRef.value.open = true;
		}
	}

	async function fetchRepositoriesList() {
		try {
			const store = await useTauriStoreLoad('repositories.bin', { autoSave: false });
			const repos = await store.get('repositories');
			repositoriesList.value = Array.isArray(repos) ? repos.map((repo: any) => ({
				name: repo.name,
				url: repo.url,
				path: repo.path
			})) : [];
		} catch (e) {
			repositoriesList.value = [];
		}
	}

	// Optionally, refresh when modal closes
	watch(
		() => commandsModalRef.value?.open,
		(open) => {
			if (open === false) fetchRepositoriesList();
		}
	);

	function signOut() {
		appLogout();
		githubLogout();
		router.push('/');
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
