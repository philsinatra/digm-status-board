import chokidar, { FSWatcher } from 'chokidar';

import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import fs from 'fs';

// Route that serves countdown data from a specified JSON file
/**
 * Serves a text/event-stream response that sends the initial countdown data
 * and updates in real-time when the underlying file changes.
 *
 * The response is a server-sent event stream, which the client can listen to
 * using the `EventSource` API. The server will send new data whenever the file
 * changes, and the client can update the UI accordingly.
 *
 * The initial data is sent as a single event with the name `"connected"` and
 * an empty data object. Subsequent updates are sent as events with the name
 * `"countdown"` and a data object containing the updated array of countdowns.
 */
export async function GET({ setHeaders, url }: RequestEvent) {
	const data_source = url.searchParams.get('data_source') || '';

	if (!data_source.startsWith('static/data/') || !data_source.endsWith('.json')) {
		throw error(
			400,
			'Invalid data source path. Must be within static/data/ directory and be a JSON file'
		);
	}
	let watcher: FSWatcher;

	setHeaders({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive'
	});

	/**
	 * Reads the countdown data from the file and returns it as an array of objects.
	 * If the file can't be read or the data is invalid, returns an empty array.
	 * @returns {Array} The array of countdowns
	 */
	const read_countdown_data = (source: string) => {
		try {
			const raw_data = fs.readFileSync(source, 'utf-8');
			const file_data = JSON.parse(raw_data);

			if (file_data && Array.isArray(file_data.countdown)) {
				return file_data.countdown;
			} else {
				console.error('Invalid countdown data format');
				return [];
			}
		} catch (error) {
			console.error('Error reading countdown data:', error);
			return [];
		}
	};

	return new Response(
		new ReadableStream({
			start(controller: ReadableStreamDefaultController<Uint8Array>) {
				const encoder = new TextEncoder();

				controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

				const initial_data = read_countdown_data(data_source);
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial_data)}\n\n`));

				watcher = chokidar.watch(data_source, {
					persistent: true,
					awaitWriteFinish: true
				});

				watcher.on('change', () => {
					const updated_data = read_countdown_data(data_source);
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(updated_data)}\n\n`));
				});
			},
			cancel() {
				if (watcher) {
					watcher.close();
				}
			}
		}),
		{
			headers: {
				'Content-Type': 'text/event-stream'
			}
		}
	);
}
