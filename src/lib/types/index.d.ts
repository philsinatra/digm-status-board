import type { RowDataPacket } from 'mysql2';

export type CountdownItem = {
	date_time: string;
	title: string;
};

export type FacultyItem = {
	email: string;
	name: string;
	office: string;
	title: string;
};

export type Quote = {
	author: string;
	quote: string;
};

export type Reel = {
	poster: string;
	program: string;
	video: string;
};

// SECTION - Database
export type DatabaseConfig = {
	host: string;
	user: string;
	password: string;
	database: string;
	port?: number;
	connectTimeout?: number;
	connectionLimit?: number;
	waitForConnections?: boolean;
};

export type BasePost = {
	ID: number;
	post_name: string;
	post_title: string;
	post_content: string;
	post_date: string | Date;
	term_name: string | null;
	term_slug: string | null;
	tag_name: string | null;
	tag_slug: string | null;
	subtitle: string;
	feature_image: string;
	feature_image_alt: string;
};

export type Post = BasePost & RowDataPacket;

export type GalleryLoadResponse = {
	posts?: Post[];
	success: boolean;
	error?: string;
	details?: string;
	total_posts?: number;
	current_page?: number;
	total_pages?: number;
};
