<template>
  <UModal v-model:open="open" title="Organization Management Panel" :ui="{ footer: 'justify-end', body: 'overflow-y-auto max-h-[90vh] p-2 sm:p-6' }">
    <template #body>
      <div class="space-y-6 w-full max-w-full">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-y-2 gap-x-4">
          <p class="text-muted mb-4">
            Manage organizations and their members. Add, edit, or remove organizations from the system.
          </p>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-code"
            @click="loadJsonataData"
          >
            View JSONata Data
          </UButton>
        </div>

        <UForm :state="inputState" :schema="schema" class="flex flex-col gap-4 w-full" @submit="handleSubmit">
          <UFormField label="Organization Name" name="name">
            <UInput v-model="inputState.name" variant="subtle" size="lg" class="w-full" />
          </UFormField>

          <UFormField label="Description" name="description">
            <UTextarea v-model="inputState.description" variant="subtle" size="lg" class="w-full" />
          </UFormField>

          <UFormField label="Members" name="members">
            <MemberSelect
              :model-value="inputState.members ?? []"
              @update:model-value="val => inputState.members = val"
              :available-users="availableUsers"
              label="Select organization members"
            />
          </UFormField>
        </UForm>

        <div class="w-full mt-6 overflow-x-auto">
          <OrganizationTable
            :organizations="organizationsList"
            @delete="removeOrganization"
            @edit="editOrganization"
          />
        </div>

        <JsonataViewer
          v-if="showJsonataData"
          title="Organizations JSONata Data"
          :data="jsonataData"
        />
      </div>
    </template>

    <template #footer>
      <UButton color="neutral" variant="outline" @click="open = false">
        Cancel
      </UButton>
      <UButton type="submit" @click="handleSubmit">
        {{ isEditing ? "Update Organization" : "Add Organization" }}
      </UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { z } from "zod";
import MemberSelect from "./MemberSelect.vue";
import JsonataViewer from "./JsonataViewer.vue";
import OrganizationTable from "./OrganizationTable.vue";
import { generateStoreData } from "../../utils/jsonataGenerator";

const open = ref(false);

const schema = z.object({
  name: z.string({
    required_error: "Organization name is required"
  }).nonempty(),
  description: z.string({
    required_error: "Description is required"
  }).nonempty(),
  members: z.array(z.object({
    username: z.string(),
    email: z.string(),
    role: z.string()
  })).optional().default([])
});

type Schema = z.infer<typeof schema>;

const inputState = ref<Partial<Schema>>({
  name: undefined,
  description: undefined,
  members: []
});

const organizationsList = ref<any[]>([]);
const availableUsers = ref<any[]>([]);
const isEditing = ref(false);
const editingOrgId = ref<string | null>(null);
const showJsonataData = ref(false);
const jsonataData = ref<any>(null);

const toast = useToast();
const store = await useTauriStoreLoad("organizations.bin", {
  autoSave: true
});

const getOrganizations = async () => {
  try {
    const orgs = await store.entries();
    const filteredOrgs = orgs
      .filter(([key]) => key.startsWith("org_"))
      .map(([_, value]) => {
        try {
          return JSON.parse(value as string);
        } catch (e) {
          console.error("Error parsing organization data:", e);
          return null;
        }
      })
      .filter(Boolean);
    organizationsList.value = filteredOrgs;
  } catch (error) {
    console.error("Error getting organizations:", error);
    toast.add({
      title: "Error",
      description: String(error),
      color: "error"
    });
  }
};

const getUsers = async () => {
  try {
    const userStore = await useTauriStoreLoad("users.bin", {
      autoSave: true
    });
    const users = await userStore.entries();
    const filteredUsers = users
      .filter(([key]) => key.startsWith("user_"))
      .map(([_, value]) => {
        try {
          const user = JSON.parse(value as string);
          return {
            username: user.username,
            email: user.email,
            role: user.role
          };
        } catch (e) {
          console.error("Error parsing user data:", e);
          return null;
        }
      })
      .filter(Boolean);
    availableUsers.value = filteredUsers;
  } catch (error) {
    console.error("Error getting users:", error);
    toast.add({
      title: "Error",
      description: String(error),
      color: "error"
    });
  }
};

const emit = defineEmits(['updated']);

const handleSubmit = async () => {
  try {
    if (!inputState.value.name || !inputState.value.description) {
      toast.add({
        title: "Error",
        description: "Please fill in all required fields",
        color: "error"
      });
      return;
    }
    const newOrg = {
      name: inputState.value.name,
      description: inputState.value.description,
      members: inputState.value.members || []
    };
    if (isEditing.value && editingOrgId.value) {
      await store.set(editingOrgId.value, JSON.stringify(newOrg));
      toast.add({
        title: "Success",
        description: "Organization updated successfully",
        color: "success"
      });
    } else {
      const orgId = `org_${Date.now()}`;
      await store.set(orgId, JSON.stringify(newOrg));
      toast.add({
        title: "Success",
        description: "Organization added successfully",
        color: "success"
      });
    }
    await getOrganizations();
    emit('updated');
    window.dispatchEvent(new CustomEvent('organizations-updated'));
    resetForm();
  } catch (error) {
    console.error("Error handling organization:", error);
    toast.add({
      title: "Error",
      description: String(error),
      color: "error"
    });
  }
};

const editOrganization = (org: any) => {
  inputState.value = {
    name: org.name,
    description: org.description,
    members: org.members || []
  };
  isEditing.value = true;
  editingOrgId.value = `org_${org.name}`;
};

const removeOrganization = async (org: any) => {
  try {
    const orgs = await store.entries();
    const orgEntry = orgs.find(([_, value]) => {
      try {
        const orgData = JSON.parse(value as string);
        return orgData.name === org.name;
      } catch (e) {
        console.error("Error parsing org data during removal:", e);
        return false;
      }
    });
    if (orgEntry) {
      await store.delete(orgEntry[0]);
      await getOrganizations();
      toast.add({
        title: "Success",
        description: "Organization removed successfully",
        color: "success"
      });
    } else {
      toast.add({
        title: "Error",
        description: "Organization not found",
        color: "error"
      });
    }
  } catch (error) {
    console.error("Error removing organization:", error);
    toast.add({
      title: "Error",
      description: String(error),
      color: "error"
    });
  }
};

const loadJsonataData = async () => {
  try {
    jsonataData.value = await generateStoreData("organizations");
    showJsonataData.value = true;
  } catch (error) {
    console.error("Error loading store data:", error);
    toast.add({
      title: "Error",
      description: "Failed to load store data",
      color: "error"
    });
  }
};

const resetForm = () => {
  inputState.value = {
    name: undefined,
    description: undefined,
    members: []
  };
  isEditing.value = false;
  editingOrgId.value = null;
};

onMounted(async () => {
  await Promise.all([getOrganizations(), getUsers()]);
});

defineExpose({
  open,
  resetForm
});
</script>

<style scoped></style> 