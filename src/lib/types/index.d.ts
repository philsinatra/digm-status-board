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

export type ScheduleItem = {
	color_override?: string;
	term_code: number;
	term_desc: string;
	subj_code: string;
	crse_numb: number;
	seq_numb: number;
	course: string;
	crn: number;
	course_title: string;
	course_title_xlst: string;
	ptrm_code: number;
	ptrm_weeks: number;
	ptrm_start_date: string;
	ptrm_end_date: string;
	coll_code: string;
	coll_desc: string;
	dept_code: number;
	dept_desc: string;
	camp_code: string;
	camp_desc: string;
	ssts_code: string;
	credit_hrs: number;
	bill_hrs: number;
	sess_code: string | null;
	sess_desc: string | null;
	schd_code: string;
	schd_desc: string;
	insm_code: string;
	insm_desc: string;
	gmod_code: string;
	gmod_desc: string;
	gradable_ind: string;
	bldg_code: string | null;
	room_code: number | null;
	begin_time: number | null;
	end_time: number | null;
	day: string | null;
	crn_count: number;
	unique_crn: number;
	seats_avail: number;
	max_enrl: number;
	enrl: number;
	primary_instructor: string;
	fatt_code: string | null;
	primary_instr_email_address: string;
	primary_instr_pcnt_responsibility: number;
	primary_instr_fctg_code: string | null;
	primary_instr_fctg_desc: string | null;
	all_instructors: string;
	job_effective_date: string | null;
	job_status: string | null;
	job_desc: string | null;
	ecls_code: string | null;
	ecls_desc: string | null;
	job_contract_type: string | null;
	load_status: string | null;
	job_begin_date: string | null;
	job_end_date: string | null;
	room_capacity: number | null;
	over_ride: string | null;
	xlst_group: string | null;
	web_avail: string;
	section_text: string | null;
	attr_code: string | null;
	attr_desc: string | null;
	census_2_enrl: number;
	census_2_date: string;
	census_enrl: number;
	census_enrl_date: string;
	unique_pri_key: number;
	text_1: string | null;
	text_2: string | null;
	text_3: string | null;
	text_4: string | null;
	wl: string;
	wait_capacity: number;
	reserved_seating: string | null;
	subj_desc: string;
	pc_attr: string | null;
	del_attr: string | null;
	start_date: string;
	integration_cde: string;
	intg_desc: string;
	intp_code: string;
	intp_desc: string;
	sapr_code: string | null;
	sapr_desc: string | null;
	process_date: string;
};
export type ResourceLink = {
	category: 'resources' | 'clubs';
	href: string;
	title: string;
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
