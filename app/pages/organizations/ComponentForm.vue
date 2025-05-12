<template>
	<UModal v-model="isOpen">
		<UCard>
			<template #header>
				<div class="flex items-center justify-between">
					<h3>Add Component</h3>
				</div>
			</template>
			<UForm
				:state="localFormState"
				:schema="schema"
				class="space-y-4"
				@submit="onSubmit"
			>
				<UFormField label="Component Type" name="type">
					<USelect
						v-model="localFormState.type"
						:items="availableComponents"
						placeholder="Select component type"
						color="primary"
					/>
				</UFormField>

				<UFormField label="Component Title" name="title">
					<UInput
						v-model="localFormState.title"
						placeholder="Enter component title"
						color="primary"
					/>
				</UFormField>

				<template v-if="localFormState.type">
					<UForm
						:state="localFormState.props"
						:schema="getPropsSchema(localFormState.type)"
						attach
						class="space-y-4"
					>
						<template v-if="localFormState.type === 'UAvatar'">
							<UFormField label="Image URL" name="src">
								<UInput v-model="localFormState.props.src" placeholder="Enter image URL" />
							</UFormField>
							<UFormField label="Alt Text" name="alt">
								<UInput v-model="localFormState.props.alt" placeholder="Enter alt text" />
							</UFormField>
						</template>

						<template v-if="localFormState.type === 'UButton'">
							<UFormField label="Button Label" name="label">
								<UInput v-model="localFormState.props.label" placeholder="Enter button text" />
							</UFormField>
						</template>

						<template v-if="localFormState.type === 'UInput'">
							<UFormField label="Placeholder" name="placeholder">
								<UInput v-model="localFormState.props.placeholder" placeholder="Enter placeholder text" />
							</UFormField>
						</template>
					</UForm>
				</template>

				<div class="flex justify-end space-x-2">
					<UButton color="neutral" @click="close">
						Cancel
					</UButton>
					<UButton type="submit" color="primary">
						Add Component
					</UButton>
				</div>
			</UForm>
		</UCard>
	</UModal>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { z } from "zod";
	import { computed, reactive, ref } from "vue";

	const props = defineProps<{
		schema: z.ZodObject<any>;
		formState: {
			type: string;
			title: string;
			props: Record<string, any>;
		};
		availableComponents: Array<{ label: string; value: string }>;
		getPropsSchema: (type: string) => z.ZodObject<any>;
		getDefaultProps: (type: string) => Record<string, any>;
	}>();

	const emit = defineEmits<{
		close: [];
		submit: [data: any];
	}>();

	const isOpen = ref(true)
	const localFormState = reactive({
		type: props.formState.type || '',
		title: props.formState.title || '',
		props: props.formState.props ? { ...props.formState.props } : {}
	});

	const onSubmit = async (event: FormSubmitEvent<any>) => {
		emit("submit", event.data);
		close();
	};

	const close = () => {
		isOpen.value = false;
		emit("close");
	};
</script> 