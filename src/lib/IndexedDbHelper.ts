import { DB_NAME, STORE_NAME } from '$lib/constants';

/** IndexedDBを開きます。 */
const openDb = () =>
	new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

/** IndexedDBへデータを追加します。 */
export const putDataToDb = async (key: string, value: Blob) => {
	const db = await openDb();
	return new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).put(value, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
};

/** IndexedDBからデータを取得します。 */
export const getDataFromDb = async <T = unknown>(key: string) => {
	const db = await openDb();
	return new Promise<T | null>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readonly');
		const req = tx.objectStore(STORE_NAME).get(key);
		req.onsuccess = () => resolve((req.result as T) ?? null);
		req.onerror = () => reject(req.error);
	});
};

/** IndexedDBからデータを削除します。 */
export const deleteDataFromDb = async (key: string) => {
	const db = await openDb();
	return new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		const req = tx.objectStore(STORE_NAME).delete(key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	})
};

/** IndexedDBを削除します。 */
export const deleteDb = () => {
	indexedDB.deleteDatabase(DB_NAME);
};
