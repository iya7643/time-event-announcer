<script lang="ts">
	import { announceVolume } from '$lib/stores';
	import { isAudioReady, playAudio } from '$lib/audio';
	import { updateAppData } from '$lib/localStorageHelper';
</script>

<!-- ボリュームコントロール＆テスト再生ボタン -->
<section
	class="is-position-fixed has-background-grey-darker px-4 py-3"
	style="bottom: 1rem; right: 1rem; width: 40%; max-width: 28rem; border-radius: 0.5rem; z-index: 100;"
>
	<div class="field is-horizontal">
		<div class="field-label is-normal nowrap mr-1">
			<div class="label">
				<p>
					音量<span class="has-text-weight-normal">（{Math.round($announceVolume * 100)}）</span>
				</p>
			</div>
		</div>
		<div class="field-body">
			<div class="field has-addons">
				<div
					class="control is-expanded px-3"
					style="border: thin solid slategray; border-radius: 0.3rem 0 0 0.3rem;"
				>
					<input type="range" min="0" max="1" step="0.01"
								 class="is-flex is-justify-content-center is-align-items-center h-100 w-100"
								 bind:value={$announceVolume}
								 on:change={() => updateAppData({ announceVolume: $announceVolume })}
					/>
				</div>
				<div class="control">
					<button class="button is-link h-100" disabled={!$isAudioReady} aria-label="test playback"
									on:click={() => playAudio()}
					>
						<i class="fas fa-play"></i>
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
