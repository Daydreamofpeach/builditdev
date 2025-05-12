<template>
	<div class="space-y-8">
		<!-- Media Components -->
		<section v-if="getComponentsByType('UAvatar').length > 0">
			<h2 class="text-xl font-semibold mb-4">Media</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="component in getComponentsByType('UAvatar')" :key="component.title" class="component">
					<UCard>
						<template #header>
							<div class="flex items-center justify-between">
								<h3>{{ component.title }}</h3>
								<div class="flex items-center gap-2">
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-pencil-square"
										@click="$emit('edit', component)"
									/>
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-trash"
										@click="$emit('delete', component)"
									/>
								</div>
							</div>
						</template>
						<div class="flex justify-center p-4">
							<UAvatar
								:src="component.props.src"
								:alt="component.props.alt"
								:size="component.props.size"
								color="primary"
							/>
						</div>
					</UCard>
				</div>
			</div>
		</section>

		<!-- Interactive Components -->
		<section v-if="getComponentsByType(['UButton', 'UInput', 'USelect']).length > 0">
			<h2 class="text-xl font-semibold mb-4">Interactive</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="component in getComponentsByType(['UButton', 'UInput', 'USelect'])" :key="component.title" class="component">
					<UCard>
						<template #header>
							<div class="flex items-center justify-between">
								<h3>{{ component.title }}</h3>
								<div class="flex items-center gap-2">
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-pencil-square"
										@click="$emit('edit', component)"
									/>
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-trash"
										@click="$emit('delete', component)"
									/>
								</div>
							</div>
						</template>
						<div class="p-4">
							<component
								:is="component.type"
								v-bind="{
									...component.props,
									color: 'primary'
								}"
							>
								<template v-if="component.type === 'UButton'">
									{{ component.props.label }}
								</template>
							</component>
						</div>
					</UCard>
				</div>
			</div>
		</section>

		<!-- Layout Components -->
		<section v-if="getComponentsByType('UCard').length > 0">
			<h2 class="text-xl font-semibold mb-4">Layout</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="component in getComponentsByType('UCard')" :key="component.title" class="component">
					<UCard
						v-bind="component.props"
						class="bg-neutral-50 dark:bg-neutral-950"
					>
						<template #header>
							<div class="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-4 rounded-t-lg">
								<h3 class="text-lg font-medium text-primary-600 dark:text-primary-400">{{ component.props.title }}</h3>
								<div class="flex items-center gap-2">
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-pencil-square"
										@click="$emit('edit', component)"
									/>
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-trash"
										@click="$emit('delete', component)"
									/>
								</div>
							</div>
						</template>
						<div class="p-4 space-y-4">
							<img
								v-if="component.props.imageUrl"
								:src="component.props.imageUrl"
								:alt="component.props.imageAlt || 'Card image'"
								class="w-full h-48 object-cover rounded-lg"
							/>
							<p class="text-neutral-700 dark:text-neutral-300">{{ component.props.content }}</p>
						</div>
						<template #footer v-if="component.props.footer">
							<div class="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-b-lg text-sm text-neutral-600 dark:text-neutral-400">
								{{ component.props.footer }}
							</div>
						</template>
					</UCard>
				</div>
			</div>
		</section>

		<!-- Form Components -->
		<section v-if="getComponentsByType('UForm').length > 0">
			<h2 class="text-xl font-semibold mb-4">Forms</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div v-for="component in getComponentsByType('UForm')" :key="component.title" class="component">
					<UCard>
						<template #header>
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-medium">{{ component.props.title }}</h3>
								<div class="flex items-center gap-2">
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-pencil-square"
										@click="$emit('edit', component)"
									/>
									<UButton
										color="primary"
										variant="ghost"
										icon="i-heroicons-trash"
										@click="$emit('delete', component)"
									/>
								</div>
							</div>
						</template>
						<div class="space-y-4">
							<p v-if="component.props.description" class="text-gray-600 dark:text-gray-400">
								{{ component.props.description }}
							</p>
							<UForm :state="formState" class="space-y-4">
								<template v-for="field in component.props.fields" :key="field.name">
									<UFormField
										:label="field.label"
										:name="field.name"
										:required="field.required"
									>
										<template v-if="field.type === 'select'">
											<USelect
												:items="field.options"
												:placeholder="field.placeholder"
												color="primary"
											/>
										</template>
										<template v-else-if="field.type === 'textarea'">
											<UTextarea
												:placeholder="field.placeholder"
												:rows="4"
												color="primary"
											/>
										</template>
										<template v-else>
											<UInput
												:type="field.type"
												:placeholder="field.placeholder"
												color="primary"
											/>
										</template>
									</UFormField>
								</template>
								<UButton
									type="submit"
									color="primary"
									:label="component.props.submitLabel || 'Submit'"
								/>
							</UForm>
						</div>
					</UCard>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	interface Component {
		type: string;
		title: string;
		props: Record<string, any>;
	}

	const props = defineProps<{
		components: Component[];
	}>();

	const emit = defineEmits<{
		(e: "edit", component: Component): void;
		(e: "delete", component: Component): void;
		(e: "formSubmit", formData: any): void;
	}>();

	const getComponentsByType = (types: string | string[]) => {
		const typeArray = Array.isArray(types) ? types : [types];
		return props.components.filter((component) => typeArray.includes(component.type));
	};

	const formState = ref({});

	const handleFormSubmit = (event: any) => {
		console.log('Form submitted:', event);
		// Here you can handle the form submission
		// For example, emit an event to the parent component
		emit('formSubmit', {
			formData: event,
			timestamp: new Date().toISOString()
		});
	};
</script>

<style scoped>
	.component {
		transition: transform 0.2s;
	}

	.component:hover {
		transform: translateY(-2px);
	}
</style> 