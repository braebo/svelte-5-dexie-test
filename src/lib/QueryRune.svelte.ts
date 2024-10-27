import type { Subscriber, Unsubscriber } from 'svelte/store'

import { untrack } from 'svelte'

export interface ReadableQuery<T> {
	subscribe(
		this: void,
		run: Subscriber<T>,
		invalidate?: () => void,
	): {
		unsubscribe: Unsubscriber
	}
}

export type ReadableValue<T> = T extends ReadableQuery<infer U> ? U : never

export class QueryRune<T = ReadableValue<ReadableQuery<unknown>>> {
	current = $state<T>()

	constructor(public readonly store: ReadableQuery<T>) {
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
