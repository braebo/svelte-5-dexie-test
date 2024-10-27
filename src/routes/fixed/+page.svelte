<script lang="ts">
	import type { EntityTable } from 'dexie'

	import { QueryRune } from '$lib/QueryRune.svelte'
	import Dexie, { liveQuery } from 'dexie'
	import { untrack } from 'svelte'

	// Setup Dexie
	const db = new Dexie('test') as Dexie & {
		settings: EntityTable<{
			id?: number
			value: string
		}>
	}
	db.version(1).stores({
		settings: '++id, value',
	})

	const settingsQuery = new QueryRune(liveQuery(async () => await db.settings.toArray()))
	const settings = $derived(settingsQuery.current)

	let key = $state(1)
	let value = $state('bar')
	let calls = $state(0)
	$effect(() => {
		settings
		untrack(() => calls++)
	})
</script>

<main>
	<h1>Dexie LiveQuery Test</h1>
	<p>This is an attempt to get liveQuery observables working with Svelte 5 $derived runes.</p>

	<div style:height="4rem"></div>

	<section>
		<h3><span style:opacity="0.5">$effect calls:</span> {calls}</h3>

		<div class="col">
			<div>
				<button onclick={() => db.settings.add({ value })}> Add </button><br />
				<pre>db.settings.add(&lbrace; value: {value} &rbrace;)</pre>
			</div>
		</div>

		<br />

		<div class="col" style:padding="0.5rem">
			<div class="row">
				<code>key</code>
				<input bind:value={key} /><br />
			</div>

			<div class="row">
				<code>value</code>
				<input bind:value /><br />
			</div>

			<div>
				<button onclick={() => db.settings.put({ id: key, value })}> Put </button>
				<pre>db.settings.put(&lbrace; id: {key}, value: {value} &rbrace;)</pre>
			</div>
		</div>

		<br />

		<div class="col">
			<div>
				<button onclick={() => db.settings.clear()}> Clear </button>
				<pre>db.settings.clear()</pre>
			</div>
		</div>
	</section>

	<pre>{JSON.stringify(settings, null, 2)}</pre>
</main>
