import chokidar, { FSWatcher } from 'chokidar';

import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import fs from 'fs';

// Route that serves JSON data from a specified file
/**
 * Serves a text/event-stream response that sends the initial JSON data
 * and updates in real-time when the underlying file changes.
 *
 * The response is a server-sent event stream, which the client can listen to
 * using the `EventSource` API. The server will send new data whenever the file
 * changes, and the client can update the UI accordingly.
 *
 * The initial data is sent as a single event with the name `"connected"` and
 * an empty data object. Subsequent updates are sent as events with the name
 * containing the JSON data.
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
	 * Reads JSON data from the file and returns it as an array of objects.
	 * If the file can't be read or the data is invalid, returns an empty array.
	 * @returns {Array} The array of data items
	 */
	const read_json_data = (source: string) => {
		try {
			const raw_data = fs.readFileSync(source, 'utf-8');
			const file_data = JSON.parse(raw_data);

			// Handle both direct arrays and objects with array properties
			if (Array.isArray(file_data)) {
				return file_data;
			} else if (file_data && typeof file_data === 'object') {
				// Look for the first array property in the object
				for (const key in file_data) {
					if (Array.isArray(file_data[key])) {
						return file_data[key];
					}
				}
			}

			console.error('Invalid JSON data format: no array found');
			return [];
		} catch (error) {
			console.error('Error reading JSON data:', error);
			return [];
		}
	};

	return new Response(
		new ReadableStream({
			start(controller: ReadableStreamDefaultController<Uint8Array>) {
				const encoder = new TextEncoder();

				controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

				const initial_data = read_json_data(data_source);
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial_data)}\n\n`));

				// Configure the watcher with options to detect file replacements
				watcher = chokidar.watch(data_source, {
					persistent: true,
					awaitWriteFinish: true,
					alwaysStat: true,
					ignoreInitial: false,
					usePolling: true, // Use polling for more reliable detection
					interval: 1000, // Poll every second
					binaryInterval: 1000 // Poll binary files every second
				});

				const update_data = () => {
					console.log(`File event detected for ${data_source}, updating data...`);
					try {
						const updated_data = read_json_data(data_source);
						controller.enqueue(encoder.encode(`data: ${JSON.stringify(updated_data)}\n\n`));
					} catch (err) {
						console.error('Error updating data after file event:', err);
					}
				};

				// Listen for various file events to catch all types of changes
				watcher.on('change', update_data); // File content changed
				watcher.on('add', update_data); // File added (useful for replacements)
				watcher.on('unlink', () => {
					// File deleted
					console.log(`File ${data_source} was deleted`);
				});
				watcher.on('error', (error) => {
					console.error(`Watcher error for ${data_source}:`, error);
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
