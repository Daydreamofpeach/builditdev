<template>
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<UIcon
				name="i-lucide-loader-2"
				class="animate-spin w-8 h-8 mb-4"
			/>
			<p class="text-lg">
				Completing authentication...
			</p>
			<p v-if="error" class="text-red-500 mt-2">
				{{ error }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	const route = useRoute();
	const router = useRouter();
	const error = ref("");

	onMounted(async () => {
		const code = route.query.code as string;

		if (!code) {
			error.value = "No code received from GitHub";
			setTimeout(() => window.close(), 2000);
			return;
		}

		try {
			// Send the code to the parent window
			if (window.opener) {
				window.opener.postMessage({ code }, window.location.origin);
				window.close();
			} else {
				// If no opener (direct navigation), redirect to home
				router.push("/");
			}
		} catch (err) {
			error.value = err.message || "Error completing authentication";
			setTimeout(() => window.close(), 2000);
		}
	});
</script>
