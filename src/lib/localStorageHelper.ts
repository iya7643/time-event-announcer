import { type AppData, defaultAppData } from '$lib/types';
import { LOCAL_STORAGE_KEY } from '$lib/constants';
import { browser } from '$app/environment';

/**
 * LocalStorageからAppDataを取得します。
 * @returns {AppData}
 */
export const loadAppData = (): [boolean, AppData] => {
	if (!browser) return [true, defaultAppData];

	let rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (rawData)  return [false, JSON.parse(rawData) as AppData];

	return [true, defaultAppData];
};

/**
 * LocalStorageへAppDataを保存します。
 * @param {AppData} appData
 */
export const saveAppData = (appData: AppData) => {
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
};

/**
 * LocalStorageのAppDataを更新します。
 * @param {Partial<AppData>} kv
 */
export const updateAppData = (kv: Partial<AppData>) => {
	if (!browser) return;

	const [, prevAppData] = loadAppData();
	const currAppData = { ...prevAppData, ...kv };
	if (JSON.stringify(prevAppData) === JSON.stringify(currAppData)) return;

	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currAppData));
};

/** LocalStorageを削除します。 */
export const deleteLocalStorage = () => {
	localStorage.removeItem(LOCAL_STORAGE_KEY);
};
