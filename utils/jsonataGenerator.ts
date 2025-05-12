import { useTauriStoreLoad } from "#imports";

export interface StoreData {
	store: string;
	timestamp: string;
	data: Record<string, any>;
}

export interface JsonataData {
	store: string;
	timestamp: string;
	entries: Array<{
		key: string;
		value: any;
	}>;
}

export async function generateStoreData(storeName: string): Promise<StoreData> {
	try {
		const store = await useTauriStoreLoad(`${storeName}.bin`, {
			autoSave: true
		});
		const entries = await store.entries();
		
		const data = entries.reduce((acc, [key, value]) => {
			try {
				const parsedValue = JSON.parse(value as string);
				acc[key] = parsedValue;
			} catch (e) {
				console.error(`Error parsing value for key ${key}:`, e);
				acc[key] = value;
			}
			return acc;
		}, {} as Record<string, any>);

		return {
			store: storeName,
			timestamp: new Date().toISOString(),
			data
		};
	} catch (error) {
		console.error(`Error generating store data for ${storeName}:`, error);
		throw error;
	}
}

export function convertToJsonata(data: StoreData): JsonataData {
	return {
		store: data.store,
		timestamp: data.timestamp,
		entries: Object.entries(data.data).map(([key, value]) => ({
			key,
			value
		}))
	};
}

export async function generateAllStoreData(): Promise<{
	timestamp: string;
	stores: StoreData[];
}> {
	try {
		const stores = ["profiles", "users", "organizations"];
		const results = await Promise.all(
			stores.map((store) => generateStoreData(store))
		);
		
		return {
			timestamp: new Date().toISOString(),
			stores: results
		};
	} catch (error) {
		console.error("Error generating all store data:", error);
		throw error;
	}
} 