// NOTE: WorldTimeAPI: ローカルPCの時刻と同じくらいずれる。
// const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Tokyo");
// const data = await res.json();
// const now = new Date(data.datetime);

// NOTE: TimeAPI: ローカルPCの時刻と同じくらいずれる。
// const res = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC");
// const data = await res.json();
// const now = new Date(data.dateTime);

import { get, writable } from 'svelte/store';
import { type AppData, defaultAppData } from '$lib/types';
import {
	announceText,
	announceTimes,
	announceTimestamps,
	announceVolume,
	apiPoint,
	dateFrom,
	dateTill,
	isAnnounceEnabled,
} from '$lib/stores';
import { API_KEY, API_POINT_URL, API_URL, CACHE_KEY, LOCAL_STORAGE_KEY } from '$lib/constants';
import { putDataToDb } from '$lib/IndexedDbHelper';
import { loadVoiceFromIdb } from '$lib/audio';
import { loadAppData, updateAppData } from '$lib/localStorageHelper';

/** ロード中 */
export let isLoading = writable<Record<string, boolean>>({
	announceText: false,
	datePeriod: false,
});

/**
 *
 * @param {string} key
 * @param {boolean} value
 */
export const updateIsLoading = (key: string, value: boolean) => {
	isLoading.update(curr => ({ ...curr, [key]: value }));
};

/**
 * アナウンス期間を更新します。
 */
export const onChangeAnnounceDays = () => {
	updateIsLoading('datePeriod', true);
	setTimeout(() => updateIsLoading('datePeriod', false), 500)
	updateAppData({
		dateFrom: get(dateFrom),
		dateTill: get(dateTill)
	});
};

/**
 * アナウンス時刻を更新します。
 * @param {Event} e
 * @param {number} i
 */
export const onChangeAnnounceTime = (e: Event, i: number) => {
	updateIsLoading(`announceTimes_${i}`, true);
	setTimeout(() => updateIsLoading(`announceTimes_${i}`, false), 500)

	const target = e.currentTarget as HTMLInputElement;
	announceTimes.update((arr) => {
		arr[i] = target.value;
		return [...arr];
	});

	const currAnnounceTimes = get(announceTimes);
	updateAppData({ announceTimes: currAnnounceTimes });

	// 時刻を本日のタイムスタンプへ変換してwritableな変数へセットします。
	const timestamps: number[] = [];
	for (const t of currAnnounceTimes) {
		if(!t) continue;

		const m = t.match(/^(\d{2}):(\d{2}):(\d{2})$/);
		if (!m) continue;
		const [, hh, mm, ss] = m.map(Number);
		const d = new Date();
		d.setHours(hh, mm, ss, 0);
		timestamps.push(d.getTime());
	}
	announceTimestamps.set(timestamps);
};

/**
 * 時刻形式でない場合、DOMのvalueを空にします。
 * @param {Event} e
 */
export const onBlurAnnounceTime = (e: Event) => {
	const target = e.currentTarget as HTMLInputElement;
	const m = target.value.match(/^(\d{2}):(\d{2}):(\d{2})$/);
	if (!m) {
		target.value = '';
	}
};

/**
 * APIポイントを取得してDOMへセットします。
 * @returns {Promise<void>}
 */
export const fetchVoiceVoxApiPoint = async (): Promise<void> => {
	try {
		const params = new URLSearchParams({
			key: API_KEY
		});
		const res = await fetch(`${API_POINT_URL}?${params.toString()}`);
		if (!res.ok) throw new Error('残りAPIポイントの取得に失敗しました。');

		const data = await res.json();
		apiPoint.set(data.points);
	} catch (e) {
		const msg = e instanceof Error ? e.message : `エラーが発生しました。\n${String(e)}`;
		console.log(msg);
	}
};

/**
 * AppDataを取得してDOMへ反映します。
 */
export const restoreUiFromAppData = () => {
	const appData = loadAppData();
	isAnnounceEnabled.set(appData.isAnnounceEnabled);
	announceVolume.set(appData.announceVolume);
	announceText.set(appData.announceText);
	dateFrom.set(appData.dateFrom);
	dateTill.set(appData.dateTill);
	announceTimes.set(appData.announceTimes);
};

/**
 * アナウンス音声をダウンロードしてアナウンステキストを保存します。
 * @returns {Promise<void>}
 */
export const fetchAndSaveVoice = async (): Promise<void> => {
	isLoading.update(curr => ({ ...curr, ['announceText']: true }));

	const prevAppData = JSON.parse(
		localStorage.getItem(LOCAL_STORAGE_KEY) ?? JSON.stringify(defaultAppData)
	) as AppData;
	const currAnnounceTest = get(announceText);

	// アナウンステキストが変わっていない場合、何もしません。。
	if (prevAppData.announceText === currAnnounceTest) {
		await new Promise(resolve => setTimeout(resolve, 1000));
		isLoading.update(curr => ({ ...curr, ['announceText']: false }));
		return;
	}

	try {
		const params = new URLSearchParams({
			key: API_KEY,
			speaker: '1',
			text: currAnnounceTest
		});
		const res = await fetch(`${API_URL}?${params.toString()}`);
		if (!res.ok) throw new Error('アナウンス音声の取得に失敗しました。');

		const blob = await res.blob();
		await putDataToDb(CACHE_KEY, blob);
		updateAppData({ announceText: currAnnounceTest });
		await loadVoiceFromIdb();
	} catch (e) {
		const msg = e instanceof Error ? e.message : `エラーが発生しました。\n${String(e)}`;
		alert(msg);
	} finally {
		isLoading.update(curr => ({ ...curr, ['announceText']: false }));
	}
};
