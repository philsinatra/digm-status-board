import type { DatabaseConfig } from '$lib/types'

import { env } from '$env/dynamic/private'

export const get_database_config = (): DatabaseConfig => ({
	host: env.DB_HOST,
	user: env.DB_USER,
	password: env.DB_PASS,
	database: env.DB_NAME,
	port: 3306,
	connectTimeout: 10000,
	connectionLimit: 25,
	waitForConnections: true
})
