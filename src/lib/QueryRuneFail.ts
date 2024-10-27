/**
 * @fileoverview
 * An attempt to encapsulate the liveQuery boilerplate within the class.
 * Unfortunately, it seems to break the reactivity.
 */

import type { Subscriber, Unsubscriber } from 'svelte/store'

import { liveQuery } from 'dexie'
import { untrack } from 'svelte'

export interface ReadableQuery<T> {
	subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): { unsubscribe: Unsubscriber }
}

export type ReadableValue<T> = T extends ReadableQuery<infer U> ? U : never

export class QueryRuneWrapped<
	TStore extends ReadableQuery<unknown>,
	TValue = ReadableValue<TStore>,
> {
	current = $state<TValue>()

	constructor(query: () => Promise<TValue>) {
		const store = liveQuery(async () => await query())

		untrack(() => {
			store
				.subscribe((v) => {
					this.current = v
				})
				.unsubscribe()
		})

		$effect.pre(() => {
			return store.subscribe((v) => {
				this.current = v
			}).unsubscribe
		})
	}
}
