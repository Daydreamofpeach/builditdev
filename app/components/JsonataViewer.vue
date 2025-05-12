<template>
	<div class="space-y-4">
		<div class="flex justify-between items-center">
			<h3 class="text-lg font-medium">{{ title }}</h3>
			<UButton
				color="neutral"
				variant="ghost"
				icon="i-lucide-copy"
				@click="copyToClipboard"
			>
				Copy
			</UButton>
		</div>

		<UTabs
			:items="[
				{ label: 'JSON', slot: 'json' },
				{ label: 'JSONata', slot: 'jsonata' },
				{ label: 'Token', slot: 'token' }
			]"
			variant="link"
			class="w-full"
			v-model="activeTab"
		>
			<template #json>
				<UCard class="mt-4">
					<div class="space-y-4">
						<div v-if="dataTags.length" class="flex flex-wrap gap-2">
							<UBadge
								v-for="tag in dataTags"
								:key="tag"
								:color="selectedTag === tag ? 'primary' : 'neutral'"
								variant="soft"
								class="cursor-pointer transition-colors duration-200 rounded-full"
								:class="{
									'ring-2 ring-primary-500 dark:ring-primary-400': selectedTag === tag,
									'opacity-75 hover:opacity-100': selectedTag !== tag
								}"
								@click="toggleTag(tag)"
							>
								{{ getUsernameFromKey(tag) }}
							</UBadge>
						</div>
						<pre class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-96">{{ filteredFormattedData }}</pre>
					</div>
				</UCard>
			</template>

			<template #jsonata>
				<UCard class="mt-4">
					<div class="space-y-4">
						<div v-if="dataTags.length" class="flex flex-wrap gap-2">
							<UBadge
								v-for="tag in dataTags"
								:key="tag"
								:color="selectedTag === tag ? 'primary' : 'neutral'"
								variant="soft"
								class="cursor-pointer transition-colors duration-200 rounded-full"
								:class="{
									'ring-2 ring-primary-500 dark:ring-primary-400': selectedTag === tag,
									'opacity-75 hover:opacity-100': selectedTag !== tag
								}"
								@click="toggleTag(tag)"
							>
								{{ getUsernameFromKey(tag) }}
							</UBadge>
						</div>
						<pre class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto max-h-96">{{ filteredJsonataData }}</pre>
					</div>
				</UCard>
			</template>

			<template #token>
				<UCard class="mt-4">
					<div class="space-y-4">
						<div v-if="dataTags.length" class="flex flex-wrap gap-2">
							<UBadge
								v-for="tag in dataTags"
								:key="tag"
								:color="selectedTag === tag ? 'primary' : 'neutral'"
								variant="soft"
								class="cursor-pointer transition-colors duration-200 rounded-full"
								:class="{
									'ring-2 ring-primary-500 dark:ring-primary-400': selectedTag === tag,
									'opacity-75 hover:opacity-100': selectedTag !== tag
								}"
								@click="toggleTag(tag)"
							>
								{{ getUsernameFromKey(tag) }}
							</UBadge>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<UButton
									color="primary"
									variant="soft"
									icon="i-lucide-key"
									@click="generateToken"
								>
									Generate Token
								</UButton>
							</div>
							<div v-if="token" class="space-y-4">
								<div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
									<div class="flex justify-between items-center mb-2">
										<h4 class="text-sm font-medium">Generated Secret</h4>
										<UButton
											color="neutral"
											variant="ghost"
											icon="i-lucide-copy"
											:ui="{ icon: { base: 'transition-transform duration-200', active: 'rotate-180' } }"
											@click="copyToClipboard(generatedSecret, 'secret')"
										>
											{{ copiedItem === 'secret' ? 'Copied!' : 'Copy' }}
										</UButton>
									</div>
									<pre class="break-all text-sm opacity-75">{{ condenseString(generatedSecret) }}</pre>
								</div>
								<div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
									<div class="flex justify-between items-center mb-2">
										<h4 class="text-sm font-medium">Generated Token</h4>
										<UButton
											color="neutral"
											variant="ghost"
											icon="i-lucide-copy"
											:ui="{ icon: { base: 'transition-transform duration-200', active: 'rotate-180' } }"
											@click="copyToClipboard(token, 'token')"
										>
											{{ copiedItem === 'token' ? 'Copied!' : 'Copy' }}
										</UButton>
									</div>
									<pre class="break-all text-sm opacity-75">{{ condenseString(token) }}</pre>
								</div>
							</div>
							<div v-else class="text-center text-gray-500 dark:text-gray-400 p-4">
								Click Generate Token to create a new token
							</div>
						</div>
					</div>
				</UCard>
			</template>
		</UTabs>
	</div>
</template>

<script setup lang="ts">
	import { jwtDecode } from "jwt-decode"

	const props = defineProps<{
		title: string;
		data: any;
		defaultTab?: string;
	}>();

	const activeTab = ref(props.defaultTab || "jsonata");

	const selectedTag = ref<string | null>(null)
	const token = ref("")
	const generatedSecret = ref("")
	const copiedItem = ref<"token" | "secret" | null>(null)

	const dataTags = computed(() => {
		if (!props.data?.data) return []
		return Object.keys(props.data.data)
	})

	const getUsernameFromKey = (key: string) => {
		if (!props.data?.data?.[key]) return key
		const data = props.data.data[key]
		if (data.name) return data.name
		if (data.username) return data.username
		return key
	}

	const filteredData = computed(() => {
		if (!selectedTag.value) return props.data
		return {
			...props.data,
			data: {
				[selectedTag.value]: props.data.data[selectedTag.value]
			}
		}
	})

	const formattedData = computed(() => {
		return JSON.stringify(props.data, null, 2)
	})

	const filteredFormattedData = computed(() => {
		return JSON.stringify(filteredData.value, null, 2)
	})

	const jsonataData = computed(() => {
		const jsonata = {
			store: props.data.store,
			timestamp: props.data.timestamp,
			entries: Object.entries(props.data.data).map(([key, value]) => ({
				key,
				value
			}))
		}
		return JSON.stringify(jsonata, null, 2)
	})

	const filteredJsonataData = computed(() => {
		const jsonata = {
			store: filteredData.value.store,
			timestamp: filteredData.value.timestamp,
			entries: Object.entries(filteredData.value.data).map(([key, value]) => ({
				key,
				value
			}))
		}
		return JSON.stringify(jsonata, null, 2)
	})

	const toggleTag = (tag: string) => {
		selectedTag.value = selectedTag.value === tag ? null : tag
	}

	const generateRandomSecret = () => {
		const array = new Uint8Array(32);
		crypto.getRandomValues(array);
		return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
	};

	const generateToken = async () => {
		try {
			const data = selectedTag.value ? filteredData.value : props.data;
			const secret = generateRandomSecret();
			generatedSecret.value = secret;

			const payload = {
				...data,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
			};

			// Generate token using the secret
			const header = {
				alg: "HS256",
				typ: "JWT"
			};

			const base64Url = (str: string) => {
				return btoa(str)
					.replace(/\+/g, "-")
					.replace(/\//g, "_")
					.replace(/=+$/, "");
			};

			const headerBase64 = base64Url(JSON.stringify(header));
			const payloadBase64 = base64Url(JSON.stringify(payload));

			const signature = await crypto.subtle.digest(
				"SHA-256",
				new TextEncoder().encode(`${headerBase64}.${payloadBase64}.${secret}`)
			);

			const signatureBase64 = base64Url(
				String.fromCharCode(...new Uint8Array(signature))
			);

			token.value = `${headerBase64}.${payloadBase64}.${signatureBase64}`;

			useToast().add({
				title: "Success",
				description: "Token generated successfully",
				color: "success"
			});
		} catch (error) {
			console.error("Error generating token:", error);
			useToast().add({
				title: "Error",
				description: "Failed to generate token",
				color: "error"
			});
		}
	};

	const condenseString = (str: string) => {
		if (str.length <= 20) return str;
		return `${str.slice(0, 10)}...${str.slice(-10)}`;
	};

	const copyToClipboard = async (text: string, item: "token" | "secret") => {
		try {
			await navigator.clipboard.writeText(text);
			copiedItem.value = item;
			setTimeout(() => {
				copiedItem.value = null;
			}, 2000);
			useToast().add({
				title: "Success",
				description: `${item === "token" ? "Token" : "Secret"} copied to clipboard`,
				color: "success"
			});
		} catch {
			useToast().add({
				title: "Error",
				description: "Failed to copy to clipboard",
				color: "error"
			});
		}
	};
</script>

<style scoped>
	pre {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style> 