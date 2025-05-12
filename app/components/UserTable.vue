<template>
	<div class="w-full overflow-x-auto">
		<UTable
			v-model:expanded="expanded"
			:data="users"
			:columns="columns"
			:ui="{ 
				tr: 'data-[expanded=true]:bg-elevated/50',
				wrapper: 'min-w-full',
				table: 'min-w-full'
			}"
			class="flex-1"
		>
			<template #expanded="{ row }">
				<div class="p-4 space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h3 class="font-medium text-gray-900 dark:text-gray-100">User Details</h3>
							<dl class="mt-2 space-y-2">
								<div class="flex">
									<dt class="w-24 text-sm text-gray-500 dark:text-gray-400">Username:</dt>
									<dd class="text-sm text-gray-900 dark:text-gray-100">{{ row.original.username }}</dd>
								</div>
								<div class="flex">
									<dt class="w-24 text-sm text-gray-500 dark:text-gray-400">Email:</dt>
									<dd class="text-sm text-gray-900 dark:text-gray-100">{{ row.original.email }}</dd>
								</div>
								<div class="flex">
									<dt class="w-24 text-sm text-gray-500 dark:text-gray-400">Role:</dt>
									<dd class="text-sm text-gray-900 dark:text-gray-100">
										<UBadge :color="getRoleColor(row.original.role)" variant="subtle">
											{{ row.original.role }}
										</UBadge>
									</dd>
								</div>
							</dl>
						</div>
						<div>
							<h3 class="font-medium text-gray-900 dark:text-gray-100">Organizations</h3>
							<div class="mt-2 flex flex-wrap gap-2">
								<template v-if="row.original.organizations?.length">
									<UBadge
										v-for="org in row.original.organizations"
										:key="org.name"
										color="primary"
										variant="subtle"
									>
										{{ org.name }}
									</UBadge>
								</template>
								<span v-else class="text-sm text-gray-500 dark:text-gray-400">No organizations</span>
							</div>
						</div>
					</div>
				</div>
			</template>
		</UTable>
	</div>
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import { h, resolveComponent } from "vue";

	interface User {
		username: string;
		email: string;
		role: string;
		organizations?: Array<{ name: string }>;
	}

	const props = defineProps<{
		users: User[];
	}>();

	const emit = defineEmits<{
		(e: "delete", user: User): void;
		(e: "edit", user: User): void;
	}>();

	const expanded = ref({});

	const getRoleColor = (role: string): "neutral" | "error" | "primary" | "secondary" | "success" | "info" | "warning" => {
		const colors = {
			admin: "error",
			developer: "warning",
			user: "info",
			client: "success",
			guest: "neutral"
		} as const
		return colors[role as keyof typeof colors] || "neutral";
	};

	const columns: TableColumn<User>[] = [
		{
			id: "expand",
			cell: ({ row }) =>
				h(resolveComponent("UButton"), {
					color: "neutral",
					variant: "ghost",
					icon: "i-lucide-chevron-down",
					square: true,
					"aria-label": "Expand",
					ui: {
						leadingIcon: [
							"transition-transform",
							row.getIsExpanded() ? "duration-200 rotate-180" : ""
						]
					},
					onClick: () => row.toggleExpanded()
				})
		},
		{
			accessorKey: "username",
			header: "Username",
			cell: ({ row }) => row.getValue("username")
		},
		{
			accessorKey: "email",
			header: "Email",
			cell: ({ row }) => row.getValue("email")
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const role = row.getValue("role") as string;
				return h(resolveComponent("UBadge"), {
					color: getRoleColor(role),
					variant: "subtle"
				}, () => role);
			}
		},
		{
			accessorKey: "organizations",
			header: "Organizations",
			cell: ({ row }) => {
				const orgs = row.getValue("organizations") as Array<{ name: string }> | undefined;
				if (!orgs || orgs.length === 0) return "-";
				return h("div", { class: "flex flex-wrap gap-1" }, orgs.map((org) =>
					h(resolveComponent("UBadge"), {
						variant: "subtle",
						color: "primary"
					}, () => org.name)
				));
			}
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const user = row.original;
				return h("div", { class: "flex gap-2" }, [
					h(resolveComponent("UButton"), {
						color: "primary",
						variant: "soft",
						icon: "i-lucide-edit",
						size: "sm",
						onClick: () => emit("edit", user)
					}),
					h(resolveComponent("UButton"), {
						color: "red",
						variant: "soft",
						icon: "i-lucide-trash",
						size: "sm",
						onClick: () => emit("delete", user)
					})
				]);
			}
		}
	];
</script>

<style scoped>
.overflow-x-auto {
	scrollbar-width: thin;
	scrollbar-color: var(--color-primary-500) var(--color-gray-800);
}

.overflow-x-auto::-webkit-scrollbar {
	height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
	background: var(--color-gray-800);
	border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
	background-color: var(--color-primary-500);
	border-radius: 3px;
}
</style>
 