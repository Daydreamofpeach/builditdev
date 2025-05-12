import { Store } from '@tauri-apps/plugin-store';

export interface TauriStore<T> {
  get: <K extends string>(key: K) => Promise<T | null>;
  set: <K extends string>(key: K, value: T) => Promise<void>;
  remove: <K extends string>(key: K) => Promise<void>;
  clear: () => Promise<void>;
}

export async function useTauriStoreLoad<T>(filename: string, options: { autoSave?: boolean } = {}): Promise<TauriStore<T>> {
  const store = await Store.load(filename);

  const get = async <K extends string>(key: K): Promise<T | null> => {
    try {
      const value = await store.get<T>(key);
      return value ?? null;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return null;
    }
  };

  const set = async <K extends string>(key: K, value: T): Promise<void> => {
    try {
      await store.set(key, value);
      if (options.autoSave) {
        await store.save();
      }
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      throw error;
    }
  };

  const remove = async <K extends string>(key: K): Promise<void> => {
    try {
      await store.delete(key);
      if (options.autoSave) {
        await store.save();
      }
    } catch (error) {
      console.error(`Error removing key ${key}:`, error);
      throw error;
    }
  };

  const clear = async (): Promise<void> => {
    try {
      await store.clear();
      if (options.autoSave) {
        await store.save();
      }
    } catch (error) {
      console.error('Error clearing store:', error);
      throw error;
    }
  };

  return {
    get,
    set,
    remove,
    clear
  };
} 