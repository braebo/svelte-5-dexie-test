<script lang="ts">
	import { page } from '$app/stores'
	import '../app.css'

	function isActive(node: HTMLAnchorElement) {
		node.classList.toggle('active', new URL(node.href).pathname === $page.url.pathname)
	}
</script>

<header>
	<a href="/" use:isActive>broken</a>
	<a href="/fixed" use:isActive>fixed</a>
</header>

<slot />

<style>
	header {
		display: flex;
		gap: 1rem;
	}

	a {
		color: white;
	}

	:global(.active) {
		color: tomato !important;
	}
</style>
