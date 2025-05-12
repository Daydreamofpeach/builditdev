<template>
	<UForm :state="formState" :schema="schema" class="space-y-4" @submit="handleSubmit">
		<UFormField label="Component Type" name="type">
			<USelect
				v-model="formState.type"
				:items="availableComponents"
				placeholder="Select component type"
				color="primary"
			/>
		</UFormField>

		<UFormField label="Component Title" name="title">
			<UInput
				v-model="formState.title"
				placeholder="Enter component title"
				color="primary"
			/>
		</UFormField>

		<template v-if="formState.type">
			<UForm
				:state="formState.props"
				:schema="getPropsSchema(formState.type)"
				attach
				class="space-y-4"
			>
				<template v-if="formState.type === 'UAvatar'">
					<UFormField label="Image URL" name="src">
						<UInput v-model="formState.props.src" placeholder="Enter image URL" color="primary" />
					</UFormField>
					<UFormField label="Alt Text" name="alt">
						<UInput v-model="formState.props.alt" placeholder="Enter alt text" color="primary" />
					</UFormField>
					<UFormField label="Size" name="size">
						<USelect
							v-model="formState.props.size"
							:items="[
								{ label: 'Small', value: 'sm' },
								{ label: 'Medium', value: 'md' },
								{ label: 'Large', value: 'lg' },
								{ label: 'Extra Large', value: 'xl' }
							]"
							placeholder="Select size"
							color="primary"
						/>
					</UFormField>
				</template>

				<template v-if="formState.type === 'UButton'">
					<UFormField label="Button Label" name="label">
						<UInput v-model="formState.props.label" placeholder="Enter button text" color="primary" />
					</UFormField>
					<UFormField label="Variant" name="variant">
						<USelect
							v-model="formState.props.variant"
							:items="[
								{ label: 'Solid', value: 'solid' },
								{ label: 'Outline', value: 'outline' },
								{ label: 'Ghost', value: 'ghost' }
							]"
							placeholder="Select variant"
							color="primary"
						/>
					</UFormField>
				</template>

				<template v-if="formState.type === 'UInput'">
					<UFormField label="Placeholder" name="placeholder">
						<UInput v-model="formState.props.placeholder" placeholder="Enter placeholder text" color="primary" />
					</UFormField>
					<UFormField label="Type" name="type">
						<USelect
							v-model="formState.props.type"
							:items="[
								{ label: 'Text', value: 'text' },
								{ label: 'Email', value: 'email' },
								{ label: 'Password', value: 'password' },
								{ label: 'Number', value: 'number' }
							]"
							placeholder="Select input type"
							color="primary"
						/>
					</UFormField>
				</template>

				<template v-if="formState.type === 'UCard'">
					<UFormField label="Card Title" name="title">
						<UInput v-model="formState.props.title" placeholder="Enter card title" color="primary" />
					</UFormField>
					<UFormField label="Card Content" name="content">
						<UTextarea v-model="formState.props.content" placeholder="Enter card content" :rows="4" color="primary" />
					</UFormField>
					<UFormField label="Image URL" name="imageUrl">
						<UInput v-model="formState.props.imageUrl" placeholder="Enter image URL (optional)" color="primary" />
					</UFormField>
					<UFormField label="Image Alt" name="imageAlt">
						<UInput v-model="formState.props.imageAlt" placeholder="Enter image alt text" color="primary" />
					</UFormField>
					<UFormField label="Footer Content" name="footer">
						<UInput v-model="formState.props.footer" placeholder="Enter footer content (optional)" color="primary" />
					</UFormField>
					<UFormField label="Variant" name="variant">
						<USelect
							v-model="formState.props.variant"
							:items="[
								{ label: 'Default', value: 'default' },
								{ label: 'Soft', value: 'soft' },
								{ label: 'Ghost', value: 'ghost' }
							]"
							placeholder="Select variant"
							color="primary"
						/>
					</UFormField>
				</template>

				<template v-if="formState.type === 'UForm'">
					<UFormField label="Form Title" name="title">
						<UInput v-model="formState.props.title" placeholder="Enter form title" color="primary" />
					</UFormField>
					<UFormField label="Form Description" name="description">
						<UTextarea v-model="formState.props.description" placeholder="Enter form description" :rows="2" color="primary" />
					</UFormField>
					<UFormField label="Submit Button Label" name="submitLabel">
						<UInput v-model="formState.props.submitLabel" placeholder="Enter submit button label" color="primary" />
					</UFormField>
					<UFormField label="Form Fields" name="fields">
						<div class="space-y-4">
							<div v-for="(field, index) in formState.props.fields" :key="index" class="p-4 border rounded-lg">
								<div class="flex justify-between items-center mb-2">
									<h4 class="font-medium">Field {{ index + 1 }}</h4>
									<UButton
										color="error"
										variant="ghost"
										icon="i-heroicons-trash"
										@click="formState.props.fields.splice(index, 1)"
									/>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<UFormField label="Field Type" :name="`fields.${index}.type`">
										<USelect
											v-model="field.type"
											:items="[
												{ label: 'Text', value: 'text' },
												{ label: 'Email', value: 'email' },
												{ label: 'Password', value: 'password' },
												{ label: 'Number', value: 'number' },
												{ label: 'Select', value: 'select' },
												{ label: 'Textarea', value: 'textarea' }
											]"
											color="primary"
										/>
									</UFormField>
									<UFormField label="Field Label" :name="`fields.${index}.label`">
										<UInput v-model="field.label" color="primary" />
									</UFormField>
									<UFormField label="Field Name" :name="`fields.${index}.name`">
										<UInput v-model="field.name" color="primary" />
									</UFormField>
									<UFormField label="Placeholder" :name="`fields.${index}.placeholder`">
										<UInput v-model="field.placeholder" color="primary" />
									</UFormField>
									<UFormField label="Required" :name="`fields.${index}.required`">
										<UToggle v-model="field.required" />
									</UFormField>
								</div>
								<div v-if="field.type === 'select'" class="mt-4">
									<UFormField label="Options" :name="`fields.${index}.options`">
										<div class="space-y-2">
											<div v-for="(option, optIndex) in field.options" :key="optIndex" class="flex gap-2">
												<UInput v-model="option.label" placeholder="Label" color="primary" />
												<UInput v-model="option.value" placeholder="Value" color="primary" />
												<UButton
													color="error"
													variant="ghost"
													icon="i-heroicons-trash"
													@click="field.options.splice(optIndex, 1)"
												/>
											</div>
											<UButton
												color="primary"
												variant="ghost"
												icon="i-heroicons-plus"
												@click="field.options.push({ label: '', value: '' })"
											>
												Add Option
											</UButton>
										</div>
									</UFormField>
								</div>
							</div>
							<UButton
								color="primary"
								variant="ghost"
								icon="i-heroicons-plus"
								@click="addFormField"
							>
								Add Field
							</UButton>
						</div>
					</UFormField>
				</template>
			</UForm>
		</template>

		<div class="flex justify-end space-x-2">
			<UButton color="neutral" @click="$emit('cancel')">
				Cancel
			</UButton>
			<UButton type="submit" color="primary">
				{{ editingIndex !== null ? 'Update Component' : 'Add Component' }}
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import { reactive, ref } from "vue";
	import * as z from "zod";

	const props = defineProps<{
		editingIndex: number | null;
		editingComponent?: {
			type: string;
			title: string;
			props: Record<string, any>;
		};
	}>();

	const emit = defineEmits<{
		(e: "submit", data: any): void;
		(e: "cancel"): void;
	}>();

	const schema = z.object({
		type: z.string().min(1, "Component type is required"),
		title: z.string().min(1, "Title is required"),
		props: z.record(z.any())
	});

	type Schema = z.output<typeof schema>;

	const getDefaultProps = (type: string) => {
		switch (type) {
			case "UForm":
				return {
					title: "",
					description: "",
					submitLabel: "Submit",
					fields: []
				};
			case "UAvatar":
				return {
					src: "https://avatars.githubusercontent.com/u/739984?v=4",
					alt: "User Avatar",
					size: "xl",
					color: "primary"
				};
			case "UButton":
				return {
					color: "primary",
					label: "Click me",
					variant: "solid"
				};
			case "UInput":
				return {
					placeholder: "Enter text",
					color: "primary",
					type: "text"
				};
			case "USelect":
				return {
					items: [],
					placeholder: "Select an option",
					color: "primary"
				};
			case "UCard":
				return {
					title: "Card Title",
					content: "This is a sample card content. You can customize this further.",
					imageUrl: "",
					imageAlt: "",
					footer: "",
					variant: "default"
				};
			default:
				return {};
		}
	};

	interface ComponentProps {
		src?: string;
		alt?: string;
		size?: string;
		label?: string;
		variant?: string;
		fields?: Array<{
			type: string;
			label: string;
			name: string;
			placeholder: string;
			required: boolean;
			options: any[];
		}>;
		[key: string]: any;
	}

	const formState = reactive<{
		type: string;
		title: string;
		props: ComponentProps;
	}>({
		type: props.editingComponent?.type || "",
		title: props.editingComponent?.title || "",
		props: props.editingComponent?.props || getDefaultProps(props.editingComponent?.type || "")
	});

	// Initialize props if it doesn't exist
	if (!formState.props) {
		formState.props = getDefaultProps(formState.type || "");
	}

	// Initialize fields array if it doesn't exist
	if (formState.type === "UForm" && !formState.props?.fields) {
		formState.props = {
			...formState.props,
			fields: []
		};
	}

	const addFormField = () => {
		if (!formState.props) {
			formState.props = getDefaultProps(formState.type || "");
		}
		if (!formState.props.fields) {
			formState.props.fields = [];
		}
		formState.props.fields.push({
			type: "text",
			label: "",
			name: "",
			placeholder: "",
			required: false,
			options: []
		});
	};

	const availableComponents = [
		{ label: "Avatar", value: "UAvatar" },
		{ label: "Button", value: "UButton" },
		{ label: "Card", value: "UCard" },
		{ label: "Input", value: "UInput" },
		{ label: "Select", value: "USelect" },
		{ label: "Form", value: "UForm" }
	];

	const getPropsSchema = (type: string) => {
		switch (type) {
			case "UForm":
				return z.object({
					title: z.string().min(1, "Title is required"),
					description: z.string().optional(),
					submitLabel: z.string().min(1, "Submit button label is required"),
					fields: z.array(
						z.object({
							type: z.string().min(1, "Field type is required"),
							label: z.string().min(1, "Field label is required"),
							name: z.string().min(1, "Field name is required"),
							placeholder: z.string().optional(),
							required: z.boolean().optional(),
							options: z.array(z.string()).optional()
						})
					).min(1, "At least one field is required")
				});
			case "UAvatar":
				return z.object({
					src: z.string().url("Please enter a valid URL"),
					alt: z.string().min(1, "Please enter alt text"),
					size: z.string().optional()
				});
			case "UButton":
				return z.object({
					label: z.string().min(1, "Please enter button text"),
					variant: z.string().optional()
				});
			case "UInput":
				return z.object({
					placeholder: z.string().min(1, "Please enter placeholder text"),
					type: z.string().optional()
				});
			case "UCard":
				return z.object({
					title: z.string().min(1, "Please enter card title"),
					content: z.string().min(1, "Please enter card content"),
					imageUrl: z.string().optional(),
					imageAlt: z.string().optional(),
					footer: z.string().optional(),
					variant: z.string().optional()
				});
			default:
				return z.object({});
		}
	};

	const handleSubmit = (event: FormSubmitEvent<Schema>) => {
		const newComponent = {
			type: formState.type,
			title: formState.title,
			props: formState.props || getDefaultProps(formState.type || "")
		};
		emit("submit", newComponent);
	};
</script> 