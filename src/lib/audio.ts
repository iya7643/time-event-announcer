import { get, writable } from 'svelte/store';
import { getDataFromDb } from '$lib/IndexedDbHelper';
import { CACHE_KEY } from '$lib/constants';
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
let objectUrl: string = '';
let initialized = false;
let unSubVolume: (() => void) | null = null;

const getTone = async (): Promise<ToneModule> => {
	if (!browser) throw new Error('Tone is browser-only');
	
	if (!tonePromise) tonePromise = import('tone').then((m: any) => m?.default ?? m);
	return tonePromise;
};

export const initAudioOnce = async () => {
	if (!browser || initialized) return;
	initialized = true;
	
	const Tone = await getTone();
	await Tone.start();
	
	gain = new Tone.Gain(get(announceVolume)).toDestination();
	player = new Tone.Player({ autostart: false }).connect(gain);
	synth = new Tone.Synth({
		oscillator: { type: 'triangle' },
		envelope: { attack: 0.001, decay: 0.05, sustain: 1, release: 0.2 }
	}).connect(gain);
	
	unSubVolume?.()
	unSubVolume = announceVolume.subscribe((v) => {
		if (gain) gain.gain.rampTo(v, 0.03);
	});
};

export const prepareVoiceFromDb = async () => {
	if (!browser) return;
	
	const blob = await getDataFromDb<Blob>(CACHE_KEY);
	if (!blob) {
		isAudioReady.set(false);
		return;
	}

	if (objectUrl) {
		URL.revokeObjectURL(objectUrl);
		objectUrl = '';
	}
	objectUrl = URL.createObjectURL(blob);

	const Tone = await getTone();
	isAudioReady.set(false);
	player?.dispose();

	const target = gain ?? new Tone.Gain(get(announceVolume)).toDestination();
	if (!gain) gain = target;

	player = new Tone.Player({ autostart: false }).toDestination();
	try {
		await player.load(objectUrl);
		isAudioReady.set(true)
	} catch (e) {
		console.error('Tone.Player load failed.', e);
		isAudioReady.set(false)	}
};

export const unlockAudio = async () => {
	await initAudioOnce();
	await prepareVoiceFromDb();
	isAudioEnabled.set(true);
};

export const playAudio = () => {
	if (!player) return;
	player.stop(0);
	player.start(0);
};

export const playBeep = async (note: string | number, duration: string | number, volume: number) => {
	if (!browser || !synth) return;

	const Tone = await getTone();
	const db = Tone.gainToDb(volume);
	synth.volume.rampTo(db, 0.03);

	// synth.triggerAttackRelease("C4", "8n", now);
	// synth.triggerAttackRelease("E4", "4n", now + 0.5);
	// synth.triggerAttackRelease("G4", "2n", now + 1);

	synth.triggerAttackRelease(note, duration);
};

export const disposeAudio = () => {
	player?.dispose();
	player = null;

	synth?.dispose();
	synth = null;

	gain?.dispose();
	gain = null;

	if (objectUrl) {
		URL.revokeObjectURL(objectUrl);
		objectUrl = '';
	}

	unSubVolume?.();
	unSubVolume = null;
	initialized = false;
	isAudioReady.set(false);
	isAudioEnabled.set(false);
};
