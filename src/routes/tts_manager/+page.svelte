<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { announceVolume, audios } from '$lib/stores';
	import { apiPoint, deleteAudio, isLoading, isPlaying, fetchAndSaveVoice, fetchVoiceVoxApiPoint } from '$lib/tts_manager';
	import { loadAppData, updateAppData } from '$lib/localStorageHelper';
	import { playAudio, playBeep } from '$lib/audio';

	let announceText = '';

	onMount(async () => {
		const [, appData] = loadAppData();
		audios.set(appData.audios);
		await fetchVoiceVoxApiPoint();
	});
</script>

<div class="container is-max-tablet">
	<section class="pt-6 pb-5">
		<div class="card">
			<div class="card-content">
				<!-- region # 音声 -->
				<div class="field">
					<p class="label">
						音声
						<span class="is-size-7 has-text-weight-normal">（VOICEVOX: ずんだもん）</span>
					</p>
					<div class="field has-addons mb-0">
						<div class="control is-expanded">
							<input class="input" type="text" placeholder="読み上げるテキストを入力してください。"
										 bind:value={announceText}
							/>
						</div>
						<div class="control">
							<button class="button is-link" disabled={!announceText}
											on:click={() => fetchAndSaveVoice(announceText)}
							>
								<i class="fa-solid mr-2"
									 class:fa-save={!$isLoading}
									 class:fa-spinner={$isLoading}
									 class:fa-spin={$isLoading}
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
			</div>
		</div>
	</section>

	<!-- region # 音声一覧 -->
	<section class="py-5">
		<div class="table-container">
			<table class="table is-bordered is-striped is-fullwidth">
				<thead>
				<tr>
					<th>テキスト</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				<!-- region # 電子音 -->
				<tr>
					<td>（電子音）</td>
					<td class="is-vcentered">
						<div class="field is-grouped is-flex is-justify-content-center">
							<div class="control">
								<button type="button" class="button is-link is-small px-3" aria-label="play voice"
												disabled={$isPlaying}
												on:click={ async () => {
														isPlaying.set(true);
														await playBeep(523, 0.6, $announceVolume)
														isPlaying.set(false);
													}}
								>
									<i class="fas fa-play"></i>
								</button>
							</div>
						</div>
					</td>
				</tr>
				<!-- endregion -->

				<!-- region # ダウンロードした音声 -->
				{#each Object.entries($audios) as [id, text]}
					<tr>
						<td>{text}</td>
						<td class="is-vcentered">
							<div class="field is-grouped is-flex is-justify-content-center">
								<div class="control">
									<button type="button" class="button is-link is-small px-3" aria-label="play voice"
													disabled={$isPlaying}
													on:click={ async () => {
														isPlaying.set(true);
														await playAudio(id);
														isPlaying.set(false);
													}}
									>
										<i class="fas fa-play"></i>
									</button>
								</div>
								<div class="control">
									<button type="button" class="button is-danger is-small px-3" aria-label="delete voice"
													disabled={$isPlaying}
													on:click={ () => deleteAudio(id) }
									>
										<i class="fas fa-trash"></i>
									</button>
								</div>
							</div>
						</td>
					</tr>
				{/each}
				<!-- endregion -->
				</tbody>
				<tfoot>
				<tr>
					<td colspan="2">
						<div class="field">
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
					</td>
				</tr>
				</tfoot>
			</table>
		</div>
	</section>
	<!-- endregion -->
</div>
