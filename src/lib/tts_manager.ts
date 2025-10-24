import { get, writable } from 'svelte/store';
import { audios } from '$lib/stores';
import { API_KEY, API_POINT_URL, API_URL } from '$lib/constants';
import { deleteDataFromDb, putDataToDb } from '$lib/IndexedDbHelper';
import { updateAppData } from '$lib/localStorageHelper';
import { browser } from '$app/environment';

/** VOICEVOX残りAPIポイント */
export let apiPoint = writable<string>('0');

/** ロード中 */
export let isLoading = writable<boolean>(false);

/** 再生中 */
export let isPlaying = writable<boolean>(false);


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
 * アナウンス音声をダウンロードしてテキストを保存します。
 * @returns {Promise<void>}
 */
export const fetchAndSaveVoice = async (announceText: string): Promise<void> => {
	isLoading.set(true);

	try {
		const params = new URLSearchParams({
			key: API_KEY,
			speaker: '1',
			text: announceText
		});
		const res = await fetch(`${API_URL}?${params.toString()}`);
		if (!res.ok) throw new Error('テキスト読み上げ音声の取得に失敗しました。');

		const id = crypto.randomUUID();
		const blob = await res.blob();
		await putDataToDb(id.toString(), blob);

		audios.update((v) => {
			const next = { ...(v ?? {}), [id.toString()]: announceText };
			updateAppData({ audios: next });
			return next;
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : `エラーが発生しました。\n${String(e)}`;
		alert(msg);
	} finally {
		isLoading.set(false);
	}
};

/**
 * アナウンス音声データを削除します。
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteAudio = async (id: string): Promise<void> => {
	await deleteDataFromDb(id);

	audios.update((v) => {
		const next = { ...(v ?? {}) };
		delete next[id];
		updateAppData({ audios: next });
		return next;
	});
};
