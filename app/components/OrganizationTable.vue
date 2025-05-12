<template>
  <div class="w-full overflow-x-auto">
    <UTable
      v-model:expanded="expanded"
      :data="organizations"
      :columns="columns"
      :ui="{ tr: 'data-[expanded=true]:bg-elevated/50', wrapper: 'min-w-full', table: 'min-w-full' }"
      class="flex-1"
    >
      <template #expanded="{ row }">
        <div class="p-4 space-y-4">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Members</h3>
            <div class="mt-2 flex flex-wrap gap-2">
              <template v-if="row.original.members?.length">
                <UBadge
                  v-for="member in row.original.members"
                  :key="member.username"
                  color="primary"
                  variant="subtle"
                >
                  {{ member.username }} ({{ member.role }})
                </UBadge>
              </template>
              <span v-else class="text-sm text-gray-500 dark:text-gray-400">No members</span>
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

interface Organization {
  name: string;
  description: string;
  members: Array<{ username: string; email: string; role: string }>;
}

const props = defineProps<{
  organizations: Organization[];
}>();

const emit = defineEmits<{
  (e: "delete", org: Organization): void;
  (e: "edit", org: Organization): void;
}>();

const expanded = ref({});

const columns: TableColumn<Organization>[] = [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.getValue("name")
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.getValue("description")
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({ row }) => {
      const members = row.getValue("members") as Array<{ username: string }>;
      if (!members || members.length === 0) return "-";
      return h(
        "div",
        { class: "flex flex-wrap gap-1" },
        members.map((member) =>
          h(
            resolveComponent("UBadge"),
            { variant: "subtle", color: "primary" },
            () => member.username
          )
        )
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const org = row.original;
      return h("div", { class: "flex gap-2" }, [
        h(resolveComponent("UButton"), {
          color: "primary",
          variant: "soft",
          icon: "i-lucide-edit",
          size: "sm",
          onClick: () => emit("edit", org)
        }),
        h(resolveComponent("UButton"), {
          color: "red",
          variant: "soft",
          icon: "i-lucide-trash",
          size: "sm",
          onClick: () => emit("delete", org)
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