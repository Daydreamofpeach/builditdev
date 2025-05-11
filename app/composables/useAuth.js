import { ref } from "vue";
import { useRuntimeConfig } from "#app";

export function useAuth() {
	const isAuthenticated = ref(false);
	const user = ref(null);
	const accessToken = ref(null);
	const config = useRuntimeConfig();

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

			user.value = await userResponse.json();
			console.log("User info received successfully");
			isAuthenticated.value = true;

			// Store token securely
			if (import.meta.client) {
				localStorage.setItem("gh_token", accessToken.value);
			}

			// Show success toast
			const toast = useToast();
			toast.add({
				title: "Success",
				description: "Successfully authenticated with GitHub",
				color: "success"
			});

			// Redirect to dashboard
			if (typeof window !== "undefined") {
				window.location.href = "/dashboard";
			}
		} catch (error) {
			console.error("Authentication error:", error);
			logout();

			// Show error toast with more details
			const toast = useToast();
			toast.add({
				title: "Error",
				description: error.message || "Failed to authenticate with GitHub",
				color: "error"
			});
		}
	};

	const login = () => {
		if (!import.meta.client) return;

		const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

		const width = 600;
		const height = 700;
		const left = window.screen.width / 2 - width / 2;
		const top = window.screen.height / 2 - height / 2;

		window.open(
			authUrl,
			"github-oauth",
			`width=${width},height=${height},top=${top},left=${left}`
		);

		// Add event listener for the callback
		window.addEventListener("message", handleAuthCallback, false);
	};

	// Check for existing token on mount
	if (import.meta.client) {
		const token = localStorage.getItem("gh_token");
		if (token) {
			accessToken.value = token;
			isAuthenticated.value = true;
			// Fetch user info
			fetch("https://api.github.com/user", {
				headers: {
					Authorization: `token ${token}`
				}
			})
				.then((res) => res.json())
				.then((data) => {
					user.value = data;
				})
				.catch(() => logout());
		}
	}

	async function fetchRepos(page = 1, perPage = 10) {
		if (!accessToken.value) return [];
		const response = await fetch(`https://api.github.com/user/repos?page=${page}&per_page=${perPage}`, {
			headers: {
				Authorization: `token ${accessToken.value}`
			}
		});
		if (!response.ok) return [];
		return await response.json();
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
