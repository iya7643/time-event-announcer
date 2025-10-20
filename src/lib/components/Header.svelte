<script lang="ts">
	import { APP_NAME, APP_VERSION } from '$lib/constants';
	import { isAnnounceEnabled } from '$lib/stores';
	import { updateAppData } from '$lib/localStorageHelper';
</script>

<nav class="navbar is-fixed-top" style="border-bottom: thin solid darkgray;">
	<div class="navbar-brand is-flex is-justify-content-space-between is-align-items-center w-100 px-3"
	>
		<p class="title is-4 pt-3 mb-1">
			{APP_NAME}
			<span class="subtitle is-6 pl-1">v{APP_VERSION}</span>
		</p>
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
	</div>
</nav>
