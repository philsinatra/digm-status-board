import type { Writable } from 'svelte/store';

type EventSourceOptions<T> = {
	data_source: string;
	on_message: (data: unknown) => T;
	target_store: Writable<T>;
	log_prefix?: string;
	debug?: boolean;
	retry_interval?: number; // Initial retry interval in ms
	max_retries?: number; // Max retry attempts
};

/**
 * Initializes an EventSource connection to a server-sent event stream.
 *
 * Automatically retries the connection if it fails, with an exponential
 * backoff. The connection is closed when the returned function is called.
 *
 * @param data_source - The filename of the data file to stream from
 * @param on_message - A callback to transform the received data, which is
 *   called with the parsed JSON data as an argument and should return the
 *   transformed data
 * @param target_store - A writable store to set with the transformed data
 * @param log_prefix - A string to prefix log messages with
 * @param debug - Whether to log debug messages
 * @param retry_interval - The initial retry interval in ms
 * @param max_retries - The maximum number of retries
 *
 * @returns A function that can be called to close the EventSource connection
 */
export function init_event_source<T>({
	data_source,
	on_message,
	target_store,
	log_prefix = 'SSE',
	debug = false,
	retry_interval = 5000,
	max_retries = 5
}: EventSourceOptions<T>) {
	let source: EventSource;
	let retry_count = 0;

	/**
	 * Connects to the SSE endpoint and sets up event listeners.
	 *
	 * @description
	 *
	 * Establishes a connection to the server-sent event stream and listens for
	 * messages, errors, and connection close events. When a message is received,
	 * it is parsed as JSON and passed to `on_message` to transform the data.
	 * The transformed data is then set on `target_store`.
	 *
	 * If the connection errors, the function will retry the connection with an
	 * exponential backoff (retrying every 5s, 10s, 20s, etc. up to
	 * `max_retries`). If the maximum number of retries is reached, the
	 * connection is not retried.
	 *
	 * The function also logs debug messages if `debug` is true.
	 */
	const connect = () => {
		source = new EventSource(`/api/data-stream?data_source=${encodeURIComponent(data_source)}`);

		/**
		 * Called when the connection is opened.
		 *
		 * Resets the retry count, because if the connection was successfully
		 * established, we don't need to retry.
		 */
		source.onopen = () => {
			if (debug) console.log(`${log_prefix} connection opened`);
			retry_count = 0; // Reset retries on successful connection
		};

		/**
		 * Called when a message is received from the server.
		 *
		 * Parses the message data as JSON and passes it to `on_message` to
		 * transform the data. If the data is invalid JSON, logs a debug error.
		 * If the transformation is successful, sets the transformed data on
		 * `target_store`.
		 *
		 * @param {MessageEvent} event The event emitted by the EventSource.
		 */
		source.onmessage = (event: MessageEvent) => {
			try {
				const raw = JSON.parse(event.data);
				const transformed = on_message(raw);
				target_store.set(transformed);
			} catch (e) {
				if (debug) console.error(`${log_prefix} parse error:`, e);
			}
		};

		/**
		 * Called when an error occurs with the EventSource connection.
		 *
		 * Logs a debug error, closes the connection, and if the maximum
		 * number of retries hasn't been reached, schedules a retry after
		 * `retry_interval` milliseconds, with exponential backoff (i.e.
		 * retrying every 5s, 10s, 20s, etc.). If the maximum number of
		 * retries is reached, logs a debug error.
		 */
		source.onerror = () => {
			if (debug) console.error(`${log_prefix} error`);
			source.close();
			if (retry_count < max_retries) {
				setTimeout(connect, retry_interval * Math.pow(2, retry_count));
				retry_count++;
				if (debug) console.log(`${log_prefix} retrying (${retry_count}/${max_retries})`);
			} else if (debug) {
				console.error(`${log_prefix} max retries reached`);
			}
		};
	};

	connect();

	return () => {
		source.close();
	};
}
