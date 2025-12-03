import mysql, { createPool } from 'mysql2/promise'

import type { DatabaseConfig } from '$lib/types'
import type { FieldPacket, PoolConnection, RowDataPacket } from 'mysql2/promise'

declare module '$env/dynamic/private' {
	export type PrivateEnv = {
		DB_HOST: string
		DB_USER: string
		DB_PASS: string
		DB_NAME: string
	}
}

export type QueryResult<T> = {
	success: boolean
	data?: T
	error?: string
}

type QueryParams = string | number | boolean | null | Buffer

export class Database {
	private pool: mysql.Pool

	/**
	 * Initializes a new instance of the Database class.
	 * Creates a connection pool using the provided configuration.
	 *
	 * @param config - The database configuration object containing the
	 * connection details such as host, user, password, and database name.
	 */
	constructor(config: DatabaseConfig) {
		this.pool = createPool({
			host: config.host,
			user: config.user,
			password: config.password,
			database: config.database,
			port: 3306,
			connectTimeout: 10000, // 10 seconds
			connectionLimit: 25,
			waitForConnections: true
		})
	}

	/**
	 * Connects to the database using the connection pool.
	 *
	 * @returns A {@link PoolConnection} object if the connection is successful, or
	 * `null` if the connection fails.
	 */
	async connect(): Promise<PoolConnection | null> {
		try {
			const connection = await this.pool.getConnection()
			return connection
		} catch (error) {
			console.error('Error connecting to database:', error)
			return null
		}
	}

	/**
	 * Executes a SQL query and returns the result as a `QueryResult` object.
	 *
	 * @param sql - The SQL query to execute.
	 * @param params - An optional array of parameters to pass to the query.
	 * @returns A `QueryResult` object containing the result of the query.
	 * If the query fails, the `success` property is set to `false` and the `error` property
	 * contains a string describing the error.
	 */
	async query<T extends RowDataPacket[]>(
		sql: string,
		params?: QueryParams[]
	): Promise<QueryResult<T>> {
		let connection: PoolConnection | null = null

		try {
			connection = await this.connect()

			if (!connection) throw new Error('Failed to establish database connection')

			const [results] = await connection.query<T>(sql, params || [])

			return { success: true, data: results }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			}
		} finally {
			if (connection) {
				connection.release()
			}
		}
	}

	/**
	 * Executes a SQL statement using a connection from the pool.
	 *
	 * @param sql - The SQL statement to execute.
	 * @param params - An optional array of parameters to pass to the statement.
	 * @returns A promise that resolves to a tuple containing the result of the execution
	 * as an array of rows (of type T) and an array of field packets.
	 * If the execution fails, an error is thrown.
	 */

	async execute<T extends RowDataPacket[]>(
		sql: string,
		params?: QueryParams[]
	): Promise<[T, FieldPacket[]]> {
		let connection: PoolConnection | null = null

		try {
			connection = await this.connect()
			if (!connection) throw new Error('Failed to establish database connection')
			return await connection.execute<T>(sql, params || [])
		} finally {
			if (connection) {
				connection.release()
			}
		}
	}

	/**
	 * Closes all connections in the connection pool.
	 *
	 * It is highly recommended to call this method when your application is
	 * shutting down to avoid memory leaks.
	 */
	async end(): Promise<void> {
		await this.pool.end()
	}
}
