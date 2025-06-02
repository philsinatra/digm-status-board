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
