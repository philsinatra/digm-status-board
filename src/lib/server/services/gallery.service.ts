import { Database } from '$lib/server/database/database';
import type { GalleryLoadResponse } from '$lib/types';

export class GalleryService {
	constructor(private db: Database) {}

	async get_posts(page: number, posts_per_page: number): Promise<GalleryLoadResponse> {
		try {
			const offset = (page - 1) * posts_per_page;

			const connection = await this.db.connect();
			if (!connection) {
				return {
					success: false,
					error: 'Failed to connect to database'
				};
			}

			const query = `
        SELECT
          p.post_title,
          p.post_content,
          GROUP_CONCAT(t.slug) as term_slug,
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'teaserImage'
            ORDER BY meta_id DESC
            LIMIT 1
          ) as teaser_image,
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'eventStartDate'
            ORDER BY meta_id DESC
            LIMIT 1
          ) as event_start_date,
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'eventEndDate'
            ORDER BY meta_id DESC
            LIMIT 1
          ) as event_end_date,
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'eventLocation'
            ORDER BY meta_id DESC
            LIMIT 1
          ) as event_location,
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'eventHost'
            ORDER BY meta_id DESC
            LIMIT 1
          ) as event_host
        FROM wp_posts p
        LEFT JOIN wp_term_relationships tr ON p.ID = tr.object_id
        LEFT JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        LEFT JOIN wp_terms t ON tt.term_id = t.term_id
        WHERE p.post_type = "post"
        AND p.post_status = "publish"
        AND (
          t.slug = "events" OR
          t.slug = "alumni" OR
          t.slug = "news" OR
          t.slug = "awards"
        )
        AND (
          t.slug != "events" OR
          (
            SELECT meta_value
            FROM wp_postmeta
            WHERE post_id = p.ID
            AND meta_key = 'eventStartDate'
            ORDER BY meta_id DESC
            LIMIT 1
          ) >= CURDATE()
        )
        GROUP BY p.ID
        ORDER BY p.post_date DESC
        LIMIT ?, ?`;

			const query_params: (string | number)[] = [offset, posts_per_page];

			const [rows] = (await connection.query(query, query_params)) as unknown as [
				GalleryLoadResponse['posts']
			];

			// Count total posts for pagination
			const count_query = `
            SELECT COUNT(DISTINCT p.ID) as total
            FROM wp_posts p
            LEFT JOIN wp_term_relationships tr ON p.ID = tr.object_id
            LEFT JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            LEFT JOIN wp_terms t ON tt.term_id = t.term_id
            WHERE p.post_type = "post"
            AND p.post_status = "publish"
            AND (
              t.slug = "events" OR
              t.slug = "alumni" OR
              t.slug = "news" OR
              t.slug = "awards"
            )
            AND (
              t.slug != "events" OR
              (
                SELECT meta_value
                FROM wp_postmeta
                WHERE post_id = p.ID
                AND meta_key = 'eventStartDate'
                ORDER BY meta_id DESC
                LIMIT 1
              ) >= CURDATE()
            )`;

			const [count_results] = (await connection.query(count_query)) as unknown as [
				{ total: number }[]
			];

			const total_posts = count_results[0]?.total ?? 0;
			const total_pages = Math.ceil(total_posts / posts_per_page);

			return {
				posts: rows,
				success: true,
				total_posts,
				current_page: page,
				total_pages
			};
		} catch (error) {
			console.error('Database error:', error);

			const db_error = error as Error;
			return {
				success: false,
				error: 'Database error occurred',
				details: db_error.message
			};
		}
	}
}
