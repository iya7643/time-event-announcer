<script lang="ts">
	import { isAudioEnabled, unlockAudio } from '$lib/audio';
	import { handleAltDel } from '$lib';
</script>

{#if !$isAudioEnabled}
	<div
		class="notification is-light is-position-fixed px-4 py-3 mx-3"
		class:is-info={!$isAudioEnabled}
		style="top: 3rem; right: 0rem; max-width: 95%; z-index: 100;"
	>
		<div class="columns is-mobile">
			<div class="column is-2">
				<div class="is-flex is-justify-content-center is-align-items-center h-100">
					<i class="fa-solid fa-triangle-exclamation fa-lg"></i>
				</div>
			</div>
			<div class="column">
				{#if !$isAudioEnabled}
					<p>ブラウザの制限により自動再生できません。</p>
					<p>
						<button type="button" class="button is-dark is-small px-2" aria-label="allow audio playback"
										on:click={() => unlockAudio()}
						>
							<i class="fa-solid fa-volume-high"></i>
						</button>
						をクリックして自動再生を許可してください。
					</p>
					<p class="has-text-right">
						<button class="button is-danger is-light is-small"
										on:click={() => handleAltDel(null)}
						>
							<span class="icon is-small">
								<i class="fas fa-exclamation"></i>
							</span>
							<span>初期化</span>
						</button>
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
