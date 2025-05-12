import { useRuntimeConfig } from "nuxt/app";
import { useAuth } from "./useAuth";

export function useGitHubApi() {
	const config = useRuntimeConfig();
	const { accessToken } = useAuth();

	// Base GitHub API URL
	const baseUrl = "https://api.github.com";

	// Headers for GitHub API requests
	const getHeaders = () => {
		const headers = {
			Accept: "application/vnd.github.v3+json"
		};

		if (accessToken.value) {
			headers.Authorization = `token ${accessToken.value}`;
		} else if (config.public.githubToken) {
			headers.Authorization = `token ${config.public.githubToken}`;
		}

		return headers;
	};

	// Fetch repository info
	const fetchRepoInfo = async (owner, repo) => {
		try {
			// Remove .git suffix if present
			const cleanRepoName = repo.replace(/\.git$/, "");

			const response = await fetch(`${baseUrl}/repos/${owner}/${cleanRepoName}`, {
				headers: getHeaders()
			});

			if (response.status === 404) {
				throw new Error(`Repository "${owner}/${cleanRepoName}" not found. Please verify the repository name and try again.`);
			}

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to fetch repository info");
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching repo info:", error);
			throw error;
		}
	};

	// Fetch contents of a directory in the repository
	const fetchRepoContents = async (owner, repo, path = "") => {
		try {
			// Remove .git suffix if present
			const cleanRepoName = repo.replace(/\.git$/, "");

			const url = path
				? `${baseUrl}/repos/${owner}/${cleanRepoName}/contents/${path}`
				: `${baseUrl}/repos/${owner}/${cleanRepoName}/contents`;

			const response = await fetch(url, {
				headers: getHeaders()
			});

			if (response.status === 404) {
				throw new Error(`Path not found in repository "${owner}/${cleanRepoName}". Please verify the path and try again.`);
			}

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to fetch repository contents");
			}

			const data = await response.json();

			// If we get a single file instead of an array, convert it to an array
			return Array.isArray(data) ? data : [data];
		} catch (error) {
			console.error("Error fetching repo contents:", error);
			throw error;
		}
	};

	// Fetch content of a specific file
	const fetchFileContent = async (owner, repo, path) => {
		try {
			// Remove .git suffix if present
			const cleanRepoName = repo.replace(/\.git$/, "");

			const response = await fetch(`${baseUrl}/repos/${owner}/${cleanRepoName}/contents/${path}`, {
				headers: getHeaders()
			});

			if (response.status === 404) {
				throw new Error(`File not found in repository "${owner}/${cleanRepoName}". Please verify the file path and try again.`);
			}

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to fetch file content");
			}

			const data = await response.json();

			// GitHub API returns file content as base64 encoded string
			return data.encoding === "base64"
				? atob(data.content) // Decode base64
				: data.content;
		} catch (error) {
			console.error("Error fetching file content:", error);
			throw error;
		}
	};

	return {
		fetchRepoInfo,
		fetchRepoContents,
		fetchFileContent
	};
}
