import type { GalleryLoadResponse } from '$lib/types';
import type { LoadEvent } from '@sveltejs/kit';

import { get_database_config } from '$lib/server/database/config';
import { Database } from '$lib/server/database/database';
import { GalleryService } from '$lib/server/services/gallery.service';

const db = new Database(get_database_config());
const gallery_service = new GalleryService(db);

/**
 * Server-side load function for /gallery page.
 *
 * @param {import('@sveltejs/kit').LoadEvent} event
 * @returns {Promise<GalleryLoadResponse>}
 */
export const load = async ({ url, depends }: LoadEvent): Promise<GalleryLoadResponse> => {
	depends('app:gallery');
	const page = Number(url.searchParams.get('page')) || 1;
	const posts_per_page = 12;

	return await gallery_service.get_posts(page, posts_per_page);
};
