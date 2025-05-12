<template>
	<div class="space-y-6 md:space-y-8">
		<!-- Account Information Section -->
		<div class="border-b pb-6">
			<UTabs
				:items="[
					{
						label: 'Account',
						icon: 'i-lucide-user',
						slot: 'account'
					},
					{
						label: 'Password',
						icon: 'i-lucide-lock',
						slot: 'password'
					}
				]"
				class="w-full"
			>
				<template #account>
					<div class="space-y-4">
						<h2 class="text-xl font-semibold mb-4">
							Account Information
						</h2>
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
									<UButton type="submit" size="lg" class="self-end">
										Save Profile
									</UButton>
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
						<h2 class="text-xl font-semibold mb-4">
							Change Password
						</h2>
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
									<UButton type="submit" size="lg" class="self-end">
										Update Password
									</UButton>
								</UForm>
							</GlowyCard>
						</GlowyCardWrapper>

						<GlowyCardWrapper>
							<GlowyCard>
								<UForm :state="passwordOutputState" class="flex flex-col gap-y-4">
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
	</div>
</template>

<script setup lang="ts">
	import GlowyCard from "./stunning/GlowyCard.vue";
	import GlowyCardWrapper from "./stunning/GlowyCardWrapper.vue";

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

	type ProfileSchema = zInfer<typeof profileSchema>;
	type PasswordSchema = zInfer<typeof passwordSchema>;

	const profileState = ref<Partial<ProfileSchema>>({
		name: undefined,
		email: undefined,
		phone: undefined,
		address: undefined
	});

	const passwordState = ref<Partial<PasswordSchema>>({
		currentPassword: undefined,
		newPassword: undefined,
		confirmPassword: undefined
	});

	const profileOutputState = ref({
		content: ""
	});

	const passwordOutputState = ref({
		content: ""
	});

	const toast = useToast();
	const autosave = ref(false);

	const store = await useTauriStoreLoad("store.bin", {
		autoSave: autosave.value
	});

	const getProfileData = async () => {
		try {
			const profileData = await store.get<ProfileSchema>("profileData");
			if (profileData) {
				profileState.value = profileData;
				profileOutputState.value.content = JSON.stringify(profileData, null, 2);
			}
		} catch (error) {
			toast.add({
				title: "Error",
				description: `Failed to load profile data: ${error}`,
				color: "error"
			});
		}
	};

	const getPasswordData = async () => {
		try {
			const passwordData = await store.get<PasswordSchema>("passwordData");
			if (passwordData) {
				passwordState.value = passwordData;
				passwordOutputState.value.content = JSON.stringify(passwordData, null, 2);
			}
		} catch (error) {
			toast.add({
				title: "Error",
				description: `Failed to load password data: ${error}`,
				color: "error"
			});
		}
	};

	await Promise.all([getProfileData(), getPasswordData()]);

	const setProfileData = async () => {
		try {
			await store.set("profileData", profileState.value);
			profileOutputState.value.content = JSON.stringify(profileState.value, null, 2);
			toast.add({
				title: "Success",
				description: "Profile data saved successfully",
				color: "success"
			});
		} catch (error) {
			toast.add({
				title: "Error",
				description: `Failed to save profile data: ${error}`,
				color: "error"
			});
		}
	};

	const setPasswordData = async () => {
		try {
			await store.set("passwordData", passwordState.value);
			passwordOutputState.value.content = JSON.stringify(passwordState.value, null, 2);
			toast.add({
				title: "Success",
				description: "Password data saved successfully",
				color: "success"
			});
			// Clear password fields after successful save
			passwordState.value = {
				currentPassword: undefined,
				newPassword: undefined,
				confirmPassword: undefined
			};
		} catch (error) {
			toast.add({
				title: "Error",
				description: `Failed to save password data: ${error}`,
				color: "error"
			});
		}
	};
</script>

<style scoped></style>
