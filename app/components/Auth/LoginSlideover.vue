<template>
	<USlideover v-model:open="isOpen" title="Login" :ui="{ footer: 'justify-end' }">
		<template #body>
			<div class="p-4 space-y-6">	<SvgoLogo
				:filled="true"
				:font-controlled="false"
				class="mx-auto z-11 rounded-4xl top-4  bg-primary size-20 border-8 border-primary"
			/>
				<!-- Local Login Form -->
				<UForm :state="formState" :schema="schema" @submit="handleLocalLogin">
					<UFormGroup label="Email" name="email">
						<UInput v-model="formState.email" type="email" placeholder="Enter your email" />
					</UFormGroup>
					<UFormGroup label="Password" name="password">
						<UInput v-model="formState.password" type="password" placeholder="Enter your password" />
					</UFormGroup>
					<UButton type="submit" block class="mt-4">
						Login
					</UButton>
				</UForm>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-white text-gray-500">Or continue with</span>
					</div>
				</div>

				<!-- GitHub Login -->
				<div class="text-center">
					<UButton
						block
						color="primary"
						icon="i-lucide-github"
						@click="handleGitHubLogin"
					>
						Continue with GitHub
					</UButton>
				</div>
			</div>
		</template>
		<template #footer>
			<UButton
				color="neutral"
				variant="ghost"
				@click="close"
			>
				Close
			</UButton>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useUserStore } from '~/composables/useUserStore';
import { useAuth } from '~/composables/useAuth';

const emit = defineEmits<{
	close: []
}>();

const { login: githubLogin } = useAuth();
const isOpen = ref(true);
const toast = useToast();

const schema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

const formState = ref({
	email: '',
	password: ''
});

const handleLocalLogin = async () => {
	try {
		const userStore = await useUserStore();
		const user = await userStore.findUser(formState.value.email, formState.value.password);
		if (!user) {
			throw new Error('Invalid email or password');
		}
		// Store user in local storage
		localStorage.setItem('currentUser', JSON.stringify({
			username: user.username,
			email: user.email,
			isGithubConnected: user.isGithubConnected || false,
			githubToken: user.githubToken
		}));
		// Close slideover
		emit('close');
		// Redirect to dashboard
		await navigateTo('/dashboard');
	} catch (error) {
		if (error instanceof Error) {
			toast.add({
				title: 'Error',
				description: error.message,
				color: 'error'
			});
		} else {
			toast.add({
				title: 'Error',
				description: 'An unexpected error occurred',
				color: 'error'
			});
		}
	}
};

function handleGitHubLogin() {
	githubLogin();
	close();
}

function close() {
	isOpen.value = false;
	emit("close");
}
</script>
