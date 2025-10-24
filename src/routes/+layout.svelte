<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/app.css';
	import 'bulma/css/bulma.min.css';
	import 'bulma-switch-control/css/main.min.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	import Header from '$lib/components/Header.svelte';
	import { APP_NAME } from '$lib/constants';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{APP_NAME}</title>
</svelte:head>

<header>
	<Header />
</header>

<main class="pt-6">
	{@render children?.()}
</main>
