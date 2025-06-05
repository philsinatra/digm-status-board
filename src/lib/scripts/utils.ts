/**
 * Returns a string representing the given Date in the format MM/DD-YYYY
 * @param date The Date object to format
 * @returns A string representing the given Date in the format MM/DD/YYYY
 */
export function get_simple_date(date: Date) {
	return `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`;
}

/**
 * Returns a string representing the given Date in the format "Weekday, MM/DD/YYYY"
 * @param date The Date object to format
 * @returns A string representing the given Date in the format "Weekday, MM/DD/YYYY"
 */
export function get_date_and_day(date: Date) {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	return `${days[date.getDay()]}, ${get_simple_date(date)}`;
}

/**
 * Calculates the number of days between now and the given date
 * @param date The future date to calculate the difference for
 * @returns The number of days between now and the given date
 */
export function get_days_until(date: Date) {
	const today = new Date();
	const time_diff = date.getTime() - today.getTime();
	const days_diff = Math.ceil(time_diff / (1000 * 3600 * 24));
	return days_diff;
}

/**
 * Truncates a given string to a maximum length, adding an ellipsis (...) at the end if it exceeds that length
 * @param str The string to truncate
 * @param max_length The maximum length of the string, defaults to 370
 * @returns The given string, truncated to the maximum length if necessary
 */
export function truncate_string(str: string, max_length: number = 370) {
	return str.length > max_length ? `${str.substring(0, max_length)}...` : str;
}

/**
 * Shuffles an array of any type using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new array with the same elements in a random order
 */
export function shuffle_array<T>(array: T[]): T[] {
	const new_array = [...array];
	for (let i = new_array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		if (new_array[i] !== undefined && new_array[j] !== undefined) {
			if (new_array[i] !== undefined && new_array[j] !== undefined) {
				[new_array[i]!, new_array[j]!] = [new_array[j]!, new_array[i]!];
			}
		}
	}
	return new_array;
}

/**
 * Slugifies the input text by converting to lowercase, replacing spaces with hyphens, removing non-word characters,
 * replacing multiple hyphens with a single hyphen, and trimming hyphens from the start and end of the text.
 * @param {string} text - The text to slugify
 * @return {string} The slugified text
 */
export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text
}
