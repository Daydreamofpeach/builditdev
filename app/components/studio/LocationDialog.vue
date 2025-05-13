<template>
	<div class="p-6 bg-neutral-900 rounded-lg shadow-lg min-w-[320px] max-w-md mx-auto">
		<h3 class="text-lg font-medium text-neutral-100 mb-4">
			Select Database Location
		</h3>
		<UForm :state="form" @submit="onConfirm">
			<UFormField
				label="Path"
				help="Enter the path where the database will be created"
				:error="error"
			>
				<UInput
					v-model="form.path"
					placeholder="Enter path"
					class="w-full"
				/>
			</UFormField>
			<div class="flex justify-end gap-2 mt-4">
				<UButton
					color="neutral"
					variant="soft"
					@click="onCancel"
				>
					Cancel
				</UButton>
				<UButton
					type="submit"
					color="primary"
				>
					Confirm
				</UButton>
			</div>
		</UForm>
	</div>
</template>

<script setup lang="ts">
	import { defineExpose, ref } from "vue";

	const props = defineProps<{
		path: string
	}>();

	const form = ref({
		path: props.path || ""
	});
	const error = ref("");

	let _resolve: (value: string | false) => void;
	const result = new Promise<string | false>((resolve) => {
		_resolve = resolve;
	});
	defineExpose({ result });

	function onCancel() {
		_resolve(false);
	}

	function onConfirm() {
		if (!form.value.path.trim()) {
			error.value = "Path is required";
			return;
		}
		_resolve(form.value.path);
	}
</script>
