<script lang="ts">
	import type { Writable } from 'svelte/store';
	import type { EntityTable } from 'dexie';

	import { fromStore } from 'svelte/store';
	import { liveQuery } from 'dexie';
	import { untrack } from 'svelte';
	import Dexie from 'dexie';
	import '../app.css';

	// Setup Dexie
	const db = new Dexie('test') as Dexie & {
		settings: EntityTable<{
			id?: number;
			value: string;
		}>;
	};
	db.version(1).stores({
		settings: '++id, value'
	});
	// Add an initial entry.
	db.on('populate', (tx) => {
		tx.table('settings').add({
			value: 'foo'
		});
	});

	// Wrap liveQuery
	const liveQ = <T,>(q: () => T | Promise<T>) =>
		fromStore({
			subscribe: (run, invalidate) => {
				return liveQuery(q).subscribe(run as () => T, invalidate).unsubscribe;
			}
		} as Writable<T>);

	// Track the settings table.
	const settingsQ = liveQ(async () => await db.settings.toArray());
	const settings = $derived(settingsQ.current);

	// Monitor calls to $effect tracking the settings query.
	let calls = $state(0);
	$effect(() => {
		settings;
		untrack(() => {
			calls++;
		});
	});

	let value = $state('bar');
</script>

<main>
	<section>
		<h1>Dexie LiveQuery Test</h1>
		<p>This is an attempt to get liveQuery observables working with Svelte 5 $derived runes.</p>

		<p>$effect calls: {calls}</p>

		<!-- Add a value -->
		<input bind:value /><br />
		<button onclick={() => db.settings.add({ value })}
			>db.settings.add(&lbrace; value: {value} &rbrace;)</button
		>

		<!-- Put over id:1 -->
		<button onclick={() => db.settings.put({ id: 1, value })}
			>db.settings.put(&lbrace; id: 1, value: {value} &rbrace;)</button
		>

		<pre>{JSON.stringify(settings, null, 2)}</pre>
	</section>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		width: 900px;
		max-width: calc(100vw - 2rem);
		margin: 0 auto;
		font-size: 1rem;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
	h1 {
		color: red;
	}
</style>
