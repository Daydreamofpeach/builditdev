import { ref } from "vue";
import { useRuntimeConfig } from "#app";
import { useCurrentUser } from "./useCurrentUser";
import { useRouter } from "vue-router";

export function useAuth() {
	const isAuthenticated = ref(false);
	const user = ref(null);
	const accessToken = ref(null);
	const config = useRuntimeConfig();
	const { user: currentUser, connectGithub } = useCurrentUser();
	const router = useRouter();

	// Only define these if we're on the client side
	const clientId = import.meta.client ? config.public.githubClientId : "";
	const redirectUri = import.meta.client ? `${window.location.origin}/auth/callback` : "";
	const scope = "repo user:email";

	const logout = () => {
		if (!import.meta.client) return;

		isAuthenticated.value = false;
		user.value = null;
		accessToken.value = null;
		localStorage.removeItem("gh_token");
		localStorage.removeItem("gh_user");
	};

	const handleAuthCallback = async (event) => {
		if (!import.meta.client) return;

		// Remove the event listener immediately to prevent multiple calls
		window.removeEventListener("message", handleAuthCallback, false);

		// Verify origin
		if (event.origin !== window.location.origin) {
			console.error("Invalid origin:", event.origin);
			return;
		}

		// Handle error from callback
		if (event.data.error) {
			console.error("Authentication error:", event.data.error);
			useTauriNotificationSendNotification({
				title: "Error",
				body: event.data.error
			});
			return;
		}

		const { code } = event.data;
		if (!code) {
			console.error("No code received in callback");
			return;
		}

		try {
			console.log("Exchanging code for token...");
			// Exchange code for access token using edge function
			const response = await fetch("/api/auth/github", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code })
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				console.error("Token exchange failed:", {
					status: response.status,
					statusText: response.statusText,
					error: errorData
				});
				throw new Error(`Failed to get access token: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Token received successfully");
			accessToken.value = data.access_token;

			console.log("Fetching user info...");
			// Get user info
			const userResponse = await fetch("https://api.github.com/user", {
				headers: {
					Authorization: `token ${accessToken.value}`
				}
			});

			if (!userResponse.ok) {
				const errorData = await userResponse.json().catch(() => null);
				console.error("User info fetch failed:", {
					status: userResponse.status,
					statusText: userResponse.statusText,
					error: errorData
				});
				throw new Error(`Failed to get user info: ${userResponse.statusText}`);
			}

			const userData = await userResponse.json();
			console.log("User info received successfully");
			user.value = userData;
			isAuthenticated.value = true;

			// Store token and user data securely
			if (import.meta.client) {
				localStorage.setItem("gh_token", accessToken.value);
				localStorage.setItem("gh_user", JSON.stringify(userData));
			}

			// If we have a local user, connect their GitHub account
			if (currentUser && currentUser.value) {
				try {
					await connectGithub(accessToken.value);
				} catch (error) {
					console.error("Error connecting GitHub account:", error);
					// Don't throw here, as we still want to complete the GitHub auth
				}
			}

			// Show success notification
			useTauriNotificationSendNotification({
				title: "Success",
				body: "Successfully authenticated with GitHub"
			});

			// Close the auth window
			if (event.source && typeof event.source.close === 'function') {
				event.source.close();
			}

			// Use router navigation instead of window.location
			if (typeof window !== "undefined") {
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Authentication error:", error);
			logout();

			// Show error notification
			useTauriNotificationSendNotification({
				title: "Error",
				body: error.message || "Failed to authenticate with GitHub"
			});

			// Close the auth window on error
			if (event.source && typeof event.source.close === 'function') {
				event.source.close();
			}
		}
	};

	const login = async () => {
		if (!import.meta.client) return;

		try {
			const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

			const width = 600;
			const height = 700;
			const left = window.screen.width / 2 - width / 2;
			const top = window.screen.height / 2 - height / 2;

			const authWindow = window.open(
				authUrl,
				"github-oauth",
				`width=${width},height=${height},top=${top},left=${left}`
			);

			if (!authWindow) {
				throw new Error('Failed to open authentication window. Please check your popup blocker settings.');
			}

			// Add event listener for the callback
			window.addEventListener("message", handleAuthCallback, false);

			return new Promise((resolve, reject) => {
				// Set a timeout to reject if the window is closed without authentication
				const timeout = setTimeout(() => {
					window.removeEventListener("message", handleAuthCallback, false);
					reject(new Error('Authentication window was closed'));
				}, 300000); // 5 minutes timeout

				// Clean up the timeout when the window is closed
				const checkWindow = setInterval(() => {
					if (authWindow.closed) {
						clearInterval(checkWindow);
						clearTimeout(timeout);
						window.removeEventListener("message", handleAuthCallback, false);
						reject(new Error('Authentication window was closed'));
					}
				}, 1000);
			});
		} catch (error) {
			console.error('Error during GitHub login:', error);
			throw error;
		}
	};

	// Check for existing token on mount
	if (import.meta.client) {
		const token = localStorage.getItem("gh_token");
		const storedUser = localStorage.getItem("gh_user");
		if (token && storedUser) {
			accessToken.value = token;
			user.value = JSON.parse(storedUser);
			isAuthenticated.value = true;
		}
	}

	async function fetchRepos(page = 1, perPage = 10) {
		// Get token from either the current user or the accessToken ref
		const token = currentUser.value?.githubToken || accessToken.value;
		if (!token) {
			console.error("No GitHub token available");
			return [];
		}

		try {
			const response = await fetch(`https://api.github.com/user/repos?page=${page}&per_page=${perPage}`, {
				headers: {
					Authorization: `token ${token}`
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch repositories: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching repositories:", error);
			useTauriNotificationSendNotification({
				title: "Error",
				body: "Failed to fetch GitHub repositories"
			});
			return [];
		}
	}

	return {
		isAuthenticated,
		user,
		accessToken,
		login,
		logout,
		fetchRepos
	};
}
