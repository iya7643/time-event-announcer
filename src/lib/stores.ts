import { writable } from 'svelte/store';

/** アナウンス音声再生許可 */
export let isAnnounceEnabled = writable<boolean>(false);

/** アナウンス音声テキスト */
export let announceText = writable<string>('');

/** VOICEVOX残りAPIポイント */
export let apiPoint = writable<string>('0');

/** 期間 */
export let dateFrom = writable<number>(0);
export let dateTill = writable<number>(0);

/** 時刻 */
export let announceTimes = writable<string[]>(Array(16).fill(''));
export let announceTimestamps = writable<number[]>([]);

/** アナウンス音声ボリューム */
export let announceVolume = writable<number>(0.5);
