import { writable } from 'svelte/store';
import type { AnnounceTime } from '$lib/types';

/** アナウンス音声再生許可 */
export let isAnnounceEnabled = writable<boolean>(false);

/** アナウンス音声ボリューム */
export let announceVolume = writable<number>(0.5);

/** 期間 */
export let dateFrom = writable<number>(0);
export let dateTill = writable<number>(0);

/** 時刻 */
export let announceTimes = writable<AnnounceTime[]>([]);

/** 音声データ情報: { キー: 読み上げるテキスト } */
export let audios = writable<Record<string, string>>({});
