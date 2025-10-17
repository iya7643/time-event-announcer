import { type AppData, defaultAppData } from '$lib/types';
import { LOCAL_STORAGE_KEY } from '$lib/constants';
import { browser } from '$app/environment';

/**
 * LocalStorageからAppDataを取得します。
 * @returns {AppData}
 */
export const loadAppData = (): AppData => {
	if (!browser) return defaultAppData;
	const rawData = localStorage.getItem(LOCAL_STORAGE_KEY) ?? JSON.stringify(defaultAppData);
	return JSON.parse(rawData) as AppData;
};

/**
 * LocalStorageのAppDataを更新します。
 * @param {Partial<AppData>} kv
 */
export const updateAppData = (kv: Partial<AppData>) => {
	if (!browser) return;

	const prevAppData = loadAppData();
	const currAppData = { ...loadAppData(), ...kv };
	if (JSON.stringify(prevAppData) === JSON.stringify(currAppData)) return;

	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currAppData));
};
