<template>
	<div class="http-test">
		<h2>HTTP Test Component</h2>
		<button class="test-button" @click="testHttp">
			Test HTTP Request
		</button>
		<div v-if="response" class="response">
			<h3>Response:</h3>
			<pre>{{ response }}</pre>
		</div>
		<div v-if="error" class="error">
			<h3>Error:</h3>
			<pre>{{ error }}</pre>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { fetch } from "@tauri-apps/plugin-http";
	import { ref } from "vue";

	const response = ref<string | null>(null);
	const error = ref<string | null>(null);

	async function testHttp() {
		try {
			console.log("Starting HTTP request...");
			const res = await fetch("https://httpbin.org/get", {
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				}
			});

			console.log("Response received:", res);
			const data = await res.json();
			response.value = JSON.stringify(data, null, 2);
			error.value = null;
		} catch (e) {
			console.error("Error details:", e);
			if (e instanceof Error) {
				error.value = `Error: ${e.message}\nStack: ${e.stack}`;
			} else if (typeof e === "string") {
				error.value = e;
			} else {
				error.value = `Unknown error: ${JSON.stringify(e, null, 2)}`;
			}
			response.value = null;
		}
	}
</script>

<style scoped>
.http-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 20px 0;
}

.test-button:hover {
  background-color: #45a049;
}

.response, .error {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.error {
  background-color: #ffebee;
  color: #c62828;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
