<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import {
		announceText,
		announceTimes,
		announceVolume,
		apiPoint,
		dateFrom,
		dateTill,
	} from '$lib/stores';
	import { isLoading, fetchAndSaveVoice, fetchVoiceVoxApiPoint, onBlurAnnounceTime, onChangeAnnounceDays,
		onChangeAnnounceTime, restoreUiFromAppData
	} from '$lib';
	import { isAudioReady, loadVoiceFromIdb, playVoice } from '$lib/audio';
	import { clockTimerStopped, nowTime, startClockAligned, today } from '$lib/clock';
	import { updateAppData } from '$lib/localStorageHelper';

	onMount(async () => {
		if (!browser) return;

		restoreUiFromAppData();
		await loadVoiceFromIdb();
		startClockAligned();
		await fetchVoiceVoxApiPoint();
	});

	onDestroy(() => {
		clockTimerStopped.set(true);
	});

	let isOpen = false;
	$: formattedDateFrom = !$dateFrom ? '' : format(new Date($dateFrom), 'yyyy/MM/dd');
	$: formattedDateTill = !$dateTill ? '' : format(new Date($dateTill), 'yyyy/MM/dd');
</script>

<div class="container is-max-tablet">
	<!-- region # 時計 -->
	<section class="pb-6 mt-6">
		<div class="is-flex is-justify-content-center is-size-1">{$today}</div>
		<div class="title clock is-flex is-justify-content-center">{$nowTime}</div>
	</section>
	<!-- endregion -->

	<!-- region # 設定 -->
	<section class="pt-4">
		<div class="card">
			<div class="card-content">
				<!-- region # アナウンス音声 -->
				<div class="field">
					<p class="label">
						音声
						<span class="is-size-7 has-text-weight-normal">（VOICEVOX: ずんだもん）</span>
					</p>
					<div class="field has-addons mb-0">
						<div class="control is-expanded">
							<input class="input" type="text" placeholder="再生する音声を入力してください。"
										 bind:value={$announceText}
							>
						</div>
						<div class="control">
							<button class="button is-link" disabled={$isLoading.announceText}
											on:click={() => fetchAndSaveVoice()}
							>
								<i class="fa-solid mr-2"
									 class:fa-save={!$isLoading.announceText}
									 class:fa-spinner={$isLoading.announceText}
									 class:fa-spin={$isLoading.announceText}
								></i>
								保存
							</button>
						</div>
					</div>
					<p class="help">
						残りAPIポイント:
						<span>{$apiPoint.toLocaleString()}</span>
					</p>
				</div>
				<!-- endregion -->

				<!-- region # 音量 -->
				<div class="field">
					<p class="label">
						音量<span class="has-text-weight-normal">（{Math.round($announceVolume * 100)}%）</span>
					</p>
					<div class="field has-addons">
						<div class="control is-expanded">
							<div class="px-4"
									 style="border: thin solid var(--bulma-input-border-color); border-radius: var(--bulma-input-radius) 0 0 var(--bulma-input-radius);"
							>
								<input type="range" min="0" max="1" step="0.01" class="input"
											 style="appearance: auto;"
											 bind:value={$announceVolume}
											 on:change={() => updateAppData({ announceVolume: $announceVolume })}
								/>
							</div>
						</div>
						<div class="control">
							<button class="button is-link h-100" disabled={!$isAudioReady} aria-label="test playback"
											on:click={() => playVoice(true)}
							>
								<i class="fas fa-play"></i>
							</button>
						</div>
					</div>
				</div>
				<!-- endregion -->

				<!-- region # 期間 -->
				<div class="field pt-5">
					<DatePicker bind:isOpen bind:startDate={$dateFrom} bind:endDate={$dateTill}
											isRange={true} isMultipane={true} enableFutureDates={true}
											onDateChange={() => onChangeAnnounceDays()}
					/>
					<p class="label">期間</p>
					<div class="field is-horizontal">
						<div class="field-body">
							<!-- region # 期間（FROM） -->
							<div class="field">
								<div class="control has-icons-right">
									<input type="text" class="input" value={formattedDateFrom} readonly
												 on:click={() => (isOpen = !isOpen)}
									/>
									{#if $isLoading.datePeriod}
										<span class="icon is-small is-right">
											<i class="fas fa-spinner fa-spin"></i>
										</span>
									{/if}
								</div>
							</div>
							<!-- endregion -->
							<!-- region # 期間（～） -->
							<div class="field">
								<p class="title is-5 is-flex is-justify-content-center is-align-items-center h-100">
									～
								</p>
							</div>
							<!-- endregion -->
							<!-- region # 期間（TILL） -->
							<div class="field">
								<div class="control has-icons-right">
									<input type="text" class="input" value={formattedDateTill} readonly
												 on:click={() => (isOpen = !isOpen)}
									/>
									{#if $isLoading.datePeriod}
										<span class="icon is-small is-right">
											<i class="fas fa-spinner fa-spin"></i>
										</span>
									{/if}
								</div>
							</div>
							<!-- endregion -->
						</div>
					</div>
				</div>
				<!-- endregion -->

				<!-- region # 時刻-->
				<div class="field">
					<p class="label">時刻</p>
					<div class="grid">
						{#each Array(16) as _, i}
							<div class="cell">
								<div class="control has-icons-right">
									<input class="input" type="time" step="1" value={$announceTimes[i]}
												 on:change={(e) => onChangeAnnounceTime(e, i)}
												 on:blur={(e) => onBlurAnnounceTime(e)}
									/>
									{#if $isLoading[`announceTimes_${i}`]}
										<span class="icon is-small is-right has-text-light">
											<i class="fas fa-spinner fa-spin"></i>
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
				<!-- endregion -->
			</div>
		</div>
	</section>
	<!-- endregion -->
</div>
