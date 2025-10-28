import { get, writable } from 'svelte/store';
import { getDataFromDb } from '$lib/IndexedDbHelper';
import { announceVolume } from '$lib/stores';
import type { ToneModule } from '$lib/types';
import { browser } from '$app/environment';

/** アナウンス音声再生準備OK（音声ダウンロード済み） */
export let isAudioReady = writable<boolean>(false);

/** 音声の自動再生可能（ユーザーによるページ上の操作があった） */
export let isAudioEnabled = writable<boolean>(false);

let tonePromise: Promise<ToneModule> | null = null;
let player: any = null;
let gain: any = null;
let synth: any = null;
let initP: Promise<void> | null = null;
let unSubVolume: (() => void) | null = null;

const bufferCache = new Map<string, any>();
let currentId = '';
let loadToken = 0;

const getTone = async (): Promise<ToneModule> => {
	if (!browser) throw new Error('Tone is browser-only');
	if (!tonePromise) tonePromise = import('tone').then((m: any) => m?.default ?? m);

	return tonePromise;
};

export const initAudioOnce = async () => {
	if (!browser) return;
	if (synth && player && gain) return;

	initP = (async () => {
		const Tone = await getTone();
		try { await Tone.start(); } catch(e) {}

		gain ??= new Tone.Gain(get(announceVolume)).toDestination();
		player ??= new Tone.Player({ autostart: false }).connect(gain);
		synth ??= new Tone.Synth({
			oscillator: { type: 'triangle' },
			envelope: { attack: 0.001, decay: 0.05, sustain: 1, release: 0.2 }
		}).connect(gain);

		if (!unSubVolume) {
			unSubVolume = announceVolume.subscribe((v) => {
				if (gain) gain.gain.rampTo(v, 0.03);
			});
		}
	})();

	try { await initP; } finally { initP = null }
};

const getAudioBuffer = async (id: string) => {
	if (!browser) return;

	if (bufferCache.has(id)) return bufferCache.get(id);

	const blob = await getDataFromDb<Blob>(id);
	if (!blob) return null;

	const Tone = await getTone();
	const url = URL.createObjectURL(blob);
	try {
		const buf = await new Promise<any>((resolve, reject) => {
			const b = new Tone.ToneAudioBuffer(
				url,
				() => resolve(b),
				(e: any) => reject(e)
			);
		});
		bufferCache.set(id, buf);
		return buf;
	} finally {
		URL.revokeObjectURL(url);
	}
};

export const prepareAudioFromDb = async (id: string) => {
	if (!browser) return;

	const myToken = ++loadToken;
	isAudioReady.set(false);

	await initAudioOnce();
	const buf = await getAudioBuffer(id);
	if (myToken !== loadToken) return;

	if (!buf) {
		isAudioReady.set(false);
		return
	}

	player.buffer = buf;
	currentId = id;
	isAudioReady.set(true);
};

export const playAudio = async (id: string) => {
	if (!browser) return;

	if (id !== currentId) {
		await prepareAudioFromDb(id);
	} else if (!player?.buffer) {
		await prepareAudioFromDb(id);
	}

	if (!player || !player.buffer) return;

	player.stop(0);

	await new Promise<void>((resolve) => {
		if (player.loop) {
			player.start(0);
			resolve();
			return;
		}
		player.onstop = () => {
			player.onstop = null as any;
			resolve();
		};
		player.start(0);
	});
};

export const playBeep = async (note: string | number, duration: string | number, volume: number) => {
	if (!browser) return;

	await initAudioOnce();
	if (!synth) return;

	const Tone = await getTone();
	synth.volume.rampTo(Tone.gainToDb(volume), 0.03);

	// synth.triggerAttackRelease("C4", "8n", now);
	// synth.triggerAttackRelease("E4", "4n", now + 0.5);
	// synth.triggerAttackRelease("G4", "2n", now + 1);

	synth.triggerAttackRelease(note, duration);

	const durSec = Tone.Time(duration).toSeconds();
	const releaseSec = (synth as any).envelope?.release ?? 0;
	const total = durSec + releaseSec + 0.02;

	await new Promise<void>((r) => setTimeout(r, Math.ceil(total * 1000)));
};

export const clearAudioCache = () => {
	if (!browser) return;

	bufferCache.forEach((buf) => buf.dispose?.());
	bufferCache.clear();
};

export const disposeAudio = () => {
	if (!browser) return;

	player?.dispose();
	player = null;

	synth?.dispose();
	synth = null;

	gain?.dispose();
	gain = null;

	unSubVolume?.();
	unSubVolume = null;
	currentId = '';
	isAudioReady.set(false);
	isAudioEnabled.set(false);
	clearAudioCache();
};

export const unlockAudio = async () => {
	if (!browser) return;

	await initAudioOnce();
	isAudioEnabled.set(true);
};
