<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { APP_NAME, APP_VERSION } from '$lib/constants';
	import { isAnnounceEnabled } from '$lib/stores';
	import { updateAppData } from '$lib/localStorageHelper';
</script>

<!-- is-flex is-justify-content-space-between is-align-items-center -->
<nav class="navbar is-fixed-top" style="border-bottom: thin solid darkgray;">
	<div class="navbar-brand w-100 px-3 is-flex is-justify-content-space-between is-align-items-center">
		<p class="title is-4 mb-0">
			<a href="{base}/">{APP_NAME}</a>
			<span class="subtitle is-6 pl-1">v{APP_VERSION}</span>
		</p>

		<div class="navbar-menu">
		</div>

		{#if $page.url.pathname !== '/tts_manager'}
			<div class="field">
				<label class="switch is-rounded">
					<input type="checkbox" value="1"
								 bind:checked={$isAnnounceEnabled}
								 on:change={() => updateAppData({ isAnnounceEnabled: $isAnnounceEnabled })}
					/>
					<span class="check is-info"></span>
					<span class="control-label">On</span>
				</label>
			</div>
		{/if}
	</div>
</nav>
