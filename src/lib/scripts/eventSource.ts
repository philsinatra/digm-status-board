import type { Writable } from 'svelte/store';

type EventSourceOptions<T> = {
	dataSource: string;
	onMessage: (data: any) => T;
	targetStore: Writable<T>;
	logPrefix?: string;
};

export function useEventSource<T>({
	dataSource,
	onMessage,
	targetStore,
	logPrefix = 'SSE'
}: EventSourceOptions<T>) {
	const source = new EventSource(`/api/data-stream?data_source=${encodeURIComponent(dataSource)}`);

	source.onopen = () => {
		console.log(`${logPrefix} connection opened`);
	};

	source.onmessage = (event: MessageEvent) => {
		try {
			const raw = JSON.parse(event.data);
			const transformed = onMessage(raw);
			targetStore.set(transformed);
		} catch (e) {
			console.error(`${logPrefix} parse error:`, e);
		}
	};

	source.onerror = (error) => {
		console.error(`${logPrefix} error:`, error);
		source.close();
	};

	return () => {
		source.close();
	};
}
