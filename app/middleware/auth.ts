import { useCurrentUser } from '~/composables/useCurrentUser';

export default defineNuxtRouteMiddleware((to) => {
  const { currentUser } = useCurrentUser();

  // If user is not authenticated and trying to access protected route
  if (!currentUser.value && to.path !== '/') {
    return navigateTo('/');
  }

  // If user is authenticated and trying to access auth pages
  if (currentUser.value && (to.path === '/login' || to.path === '/signup')) {
    return navigateTo('/dashboard');
  }
}); 