// NOTE: WorldTimeAPI: ローカルPCの時刻と同じくらいずれる。
// const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Tokyo");
// const data = await res.json();
// const now = new Date(data.datetime);

// NOTE: TimeAPI: ローカルPCの時刻と同じくらいずれる。
// const res = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=UTC");
// const data = await res.json();
// const now = new Date(data.dateTime);

import { get, writable } from 'svelte/store';
import {
	announceTimes,
	announceVolume,
	dateFrom,
	dateTill,
	isAnnounceEnabled,
	audios
} from '$lib/stores';
import { deleteLocalStorage, updateAppData } from '$lib/localStorageHelper';
import type { AppData } from '$lib/types';
import { deleteDb } from '$lib/IndexedDbHelper';

/** ロード中 */
export let isLoading = writable<Record<string, boolean>>({
	announceText: false,
	datePeriod: false,
});

/**
 * AppDataを取得してDOMへ反映します。
 */
export const restoreUiFromAppData = (appData: AppData) => {
	isAnnounceEnabled.set(appData.isAnnounceEnabled);
	announceVolume.set(appData.announceVolume);
	dateFrom.set(appData.dateFrom);
	dateTill.set(appData.dateTill);
	announceTimes.set(appData.announceTimes);
	audios.set(appData.audios);
};

/**
 * ローディング中ステータスを更新します。
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
 * @param {number} no
 */
export const onChangeAnnounceTime = (e: Event, no: number) => {
	updateIsLoading(`announceTimes_${no}`, true);
	setTimeout(() => updateIsLoading(`announceTimes_${no}`, false), 500)

	const timeDom = e.currentTarget as HTMLInputElement;
	const time = timeDom.value;
	const [hh, mm, ss] = (time.split(":").map(Number) as number[])
		.map((n) => (isNaN(n) ? 0 : n));

	announceTimes.update((arr) => {
		// 対応するnoを持つ要素を探して更新
		return arr.map((item) =>
			item.no === no ? { ...item, time: time , offsetMs: (hh * 60 * 60 + mm * 60 + ss) * 1000} : item
		);
	});

	const currAnnounceTimes = get(announceTimes);
	updateAppData({ announceTimes: currAnnounceTimes });
};

/**
 * 時刻形式でない場合、DOMのvalueを空にします。
 * @param {Event} e
 */
export const onBlurAnnounceTime = (e: Event) => {
	const timeDom = e.currentTarget as HTMLInputElement;
	const m = timeDom.value.match(/^(\d{2}):(\d{2}):(\d{2})$/);
	if (!m) {
		timeDom.value = '';
	}
};

/**
 * アナウンス音を更新します。
 * @param {Event} e
 * @param {number} no
 */
export const onChangeAnnounceAudio = (e: Event, no: number) => {
	const audioDom = e.currentTarget as HTMLInputElement;
	announceTimes.update((arr) => {
		// 対応するnoを持つ要素を探して更新
		return arr.map((item) =>
			item.no === no ? { ...item, audioId: audioDom.value } : item
		);
	});

	const currAnnounceTimes = get(announceTimes);
	updateAppData({ announceTimes: currAnnounceTimes });
};

/**
 * Alt + Delete でLocalStorageとIndexedDBを削除します。
 * @param {KeyboardEvent} ev
 */
export const handleAltDel = (ev: KeyboardEvent | null) => {
	const initConfig = () => {
		if (confirm('初期化してよろしいですか？')) {
			deleteLocalStorage();
			deleteDb();
			location.reload();
		}
	};

	if(ev) {
		if (ev.repeat) return;

		const target = ev.target as HTMLElement;
		const tagName = target.tagName;
		const isEditable = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName);
		if (ev.altKey && ev.key === 'Delete' && !isEditable) {
			ev.preventDefault();
			initConfig();
		}
		return;
	}

	initConfig();
};
