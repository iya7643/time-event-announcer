<script lang="ts">
	import { isAudioEnabled, isAudioReady, unlockAudio } from '$lib/audio';
	import { isTextToSpeech } from '$lib/stores';
</script>

{#if (!$isAudioReady && $isTextToSpeech) || !$isAudioEnabled}
	<div
		class="notification is-light is-position-fixed px-4 py-3 mx-3"
		class:is-danger={!$isAudioReady && $isTextToSpeech}
		class:is-info={!$isAudioEnabled}
		style="top: 2.5rem; right: 0rem; max-width: 95%; z-index: 100;"
	>
		<div class="columns is-mobile">
			<div class="column is-2">
				<div class="is-flex is-justify-content-center is-align-items-center h-100">
					<i class="fa-solid fa-triangle-exclamation fa-lg"></i>
				</div>
			</div>
			<div class="column">
				{#if !$isAudioReady && $isTextToSpeech}
					<p>アナウンス音声が保存されていません。</p>
				{:else if !$isAudioEnabled}
					<p>ブラウザの制限により自動再生できません。</p>
					<p>
						<button type="button" class="button is-dark is-small px-2" aria-label="allow audio playback"
										on:click={() => unlockAudio()}
						>
							<i class="fa-solid fa-volume-high"></i>
						</button>
						をクリックして自動再生を許可してください。
					</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
