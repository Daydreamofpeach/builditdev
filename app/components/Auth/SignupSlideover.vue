<template>
	<USlideover v-model:open="isOpen" title="Sign Up" :ui="{ footer: 'justify-end' }">
		<template #body>
			<div class="p-4 space-y-6">	
				<SvgoLogo
				:filled="true"
				:font-controlled="false"
				class="mx-auto  z-11 rounded-2xl top-4 bg-primary size-20 border-8 border-primary"
			/>
				<!-- Local Signup Form -->
				<UForm :state="formState" :schema="schema" @submit="handleLocalSignup">
					<UFormGroup label="Username" name="username">
						<UInput v-model="formState.username" placeholder="Choose a username" />
					</UFormGroup>
					<UFormGroup label="Email" name="email">
						<UInput v-model="formState.email" type="email" placeholder="Enter your email" />
					</UFormGroup>
					<UFormGroup label="Password" name="password">
						<UInput v-model="formState.password" type="password" placeholder="Choose a password" />
					</UFormGroup>
					<UButton type="submit" block class="mt-4">
						Create Account
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

				<!-- GitHub Signup -->
				<div class="text-center">
					<UButton
						block
						color="primary"
						icon="i-lucide-github"
						@click="handleGitHubSignup"
					>
						Sign up with GitHub
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
	username: z.string().min(3, 'Username must be at least 3 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

const formState = ref({
	username: '',
	email: '',
	password: ''
});

const handleLocalSignup = async () => {
	try {
		const userStore = await useUserStore();
		await userStore.addUser({
			username: formState.value.username,
			email: formState.value.email,
			password: formState.value.password
		});
		// Store user in local storage
		localStorage.setItem('currentUser', JSON.stringify({
			username: formState.value.username,
			email: formState.value.email,
			isGithubConnected: false
		}));
		// Close slideover
		emit('close');
		// Redirect to dashboard
		navigateTo('/dashboard');
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

function handleGitHubSignup() {
	githubLogin();
	close();
}

function close() {
	isOpen.value = false;
	emit("close");
}
</script>
