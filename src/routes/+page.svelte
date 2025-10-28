<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import { DatePicker } from '@svelte-plugins/datepicker';
	import { format } from 'date-fns';
	import { announceTimes, announceVolume, dateFrom, dateTill, audios } from '$lib/stores';
	import {
		handleAltDel,
		isLoading, onBlurAnnounceTime, onChangeAnnounceAudio, onChangeAnnounceDays,
		onChangeAnnounceTime, restoreUiFromAppData
	} from '$lib';
	import { disposeAudio } from '$lib/audio';
	import { clockTimerStopped, nowTime, startClockAligned, today } from '$lib/clock';
	import Notification from '$lib/components/Notification.svelte';
	import { loadAppData, saveAppData, updateAppData } from '$lib/localStorageHelper';

	const mount = () => {
		if (!browser) return;

		const [isInit, appData] = loadAppData();
		restoreUiFromAppData(appData);
		if (isInit) saveAppData(appData);

		clockTimerStopped.set(false);
		startClockAligned();

		// Note: タブレットだと実行できないのでコメントアウト
		// window.addEventListener('keydown', handleAltDel);
	};

	const destroy = () => {
		if (!browser) return;

		clockTimerStopped.set(true);
		disposeAudio();
		// window.removeEventListener('keydown', handleAltDel);
	};

	onMount(() => mount());
	onDestroy(() => destroy());

	let isOpen = false;
	$: formattedDateFrom = !$dateFrom ? '' : format(new Date($dateFrom), 'yyyy/MM/dd');
	$: formattedDateTill = !$dateTill ? '' : format(new Date($dateTill), 'yyyy/MM/dd');
</script>

<Notification />

<div class="container is-max-tablet">
	<!-- region # 時計 -->
	<section class="pb-6 mt-6">
		<div class="is-flex is-justify-content-center is-size-1">{$today}</div>
		<div class="title clock is-flex is-justify-content-center">{$nowTime}</div>
	</section>
	<!-- endregion -->

	<!-- region # 設定 -->
	<section class="pt-4 mb-6">
		<div class="card">
			<div class="card-content">
				<!-- region # 期間 -->
				<div class="field">
					<DatePicker bind:isOpen bind:startDate={$dateFrom} bind:endDate={$dateTill}
											isRange={true} isMultipane={true} enableFutureDates={true}
											onDateChange={() => onChangeAnnounceDays()}
					/>
					<p class="label">期間</p>
					<div class="columns is-mobile">
						<!-- region # 期間（FROM） -->
						<div class="column">
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
						<div class="column is-2-mobile is-1-tablet">
							<p class="title is-5 is-flex is-justify-content-center is-align-items-center h-100">
								～
							</p>
						</div>
						<!-- endregion -->

						<!-- region # 期間（TILL） -->
						<div class="column">
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
				<!-- endregion -->

				<!-- region # 音量 -->
				<div class="field pt-4">
					<p class="label mb-0">
						音量<span class="has-text-weight-normal">（{Math.round($announceVolume * 100)}%）</span>
					</p>
					<div class="control is-expanded">
						<div class="px-4">
							<input type="range" min="0" max="1" step="0.01" class="input"
										 style="appearance: auto;"
										 bind:value={$announceVolume}
										 on:change={() => updateAppData({ announceVolume: $announceVolume })}
							/>
						</div>
					</div>
				</div>
				<!-- endregion -->

				<!-- region # 時刻-->
				<div class="field">
					{#each $announceTimes as announceTime, i}
						{#if (i === 0)}
							<div class="columns is-mobile">
								<div class="column is-1-mobile is-flex is-justify-content-right is-align-items-center">
									<p class="label">No</p>
								</div>
								<div class="column is-4-mobile is-3-tablet">
									<p class="label">時刻</p>
								</div>
								<div class="column is-7-mobile is-8-tablet">
									<p class="label">
										<a href="{base}/tts_manager">アナウンス音</a>
									</p>
								</div>
							</div>
						{/if}
						<div class="columns is-mobile">
							<div class="column is-1-mobile is-flex is-justify-content-right is-align-items-center">
								<p>{(i + 1)}</p>
							</div>
							<div class="column is-4-mobile is-3-tablet">
								<div class="control has-icons-right">
									<input class="input" type="time" step="1" value={announceTime.time}
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
							<div class="column is-7-mobile is-8-tablet">
								<div class="select w-100">
									<select class="w-100"
													bind:value={announceTime.audioId}
													on:change={(e) => onChangeAnnounceAudio(e, i)}
									>
										<option value="beep">電子音</option>
										{#each Object.entries($audios) as [id, text]}
											<option value={id}>{text}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<!-- endregion -->
			</div>
		</div>
	</section>
	<!-- endregion -->
</div>
