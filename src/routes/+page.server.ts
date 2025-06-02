import { Database } from '$lib/server/database/database';
import { EventsService } from '$lib/server/services/events.service';
import type { GalleryLoadResponse } from '$lib/types';
import { get_database_config } from '$lib/server/database/config';

const db = new Database(get_database_config());
const events_service = new EventsService(db);

/**
 * Server-side load function for /gallery page.
 *
 * @param {import('@sveltejs/kit').LoadEvent} event
 * @returns {Promise<GalleryLoadResponse>}
 */
export const load = async ({ url }): Promise<GalleryLoadResponse> => {
	const page = Number(url.searchParams.get('page')) || 1;
	const posts_per_page = 12;

	return await events_service.get_events(page, posts_per_page);
};
