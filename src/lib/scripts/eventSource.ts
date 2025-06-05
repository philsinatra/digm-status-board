import type { Writable } from 'svelte/store';

type EventSourceOptions<T> = {
	data_source: string;
	on_message: (data: unknown) => T;
	target_store: Writable<T>;
	log_prefix?: string;
	debug?: boolean;
};

export function init_event_source<T>({
	data_source,
	on_message,
	target_store,
	log_prefix = 'SSE',
	debug = false
}: EventSourceOptions<T>) {
	const source = new EventSource(`/api/data-stream?data_source=${encodeURIComponent(data_source)}`);

	source.onopen = () => {
		if (debug) console.log(`${log_prefix} connection opened`);
	};

	source.onmessage = (event: MessageEvent) => {
		try {
			const raw = JSON.parse(event.data);
			const transformed = on_message(raw);
			target_store.set(transformed);
		} catch (e) {
			if (debug) console.error(`${log_prefix} parse error:`, e);
		}
	};

	source.onerror = (error) => {
		if (debug) console.error(`${log_prefix} error:`, error);
		source.close();
	};

	return () => {
		source.close();
	};
}
