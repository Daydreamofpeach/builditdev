import { ref, computed, watch } from 'vue';

export interface AuthUser {
  username: string;
  email: string;
  isGithubConnected?: boolean;
  githubToken?: string;
}

const currentUser = ref<AuthUser | null>(null);

// Load from localStorage on composable init
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored);
    } catch {
      currentUser.value = null;
    }
  }
}

export const isLoggedIn = computed(() => !!currentUser.value);

export function login(user: AuthUser) {
  currentUser.value = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function logout() {
  currentUser.value = null;
  localStorage.removeItem('currentUser');
}

// Keep localStorage in sync if currentUser changes
watch(currentUser, (val) => {
  if (val) {
    localStorage.setItem('currentUser', JSON.stringify(val));
  } else {
    localStorage.removeItem('currentUser');
  }
});

export function useAuthState() {
  return { currentUser, isLoggedIn, login, logout };
} 