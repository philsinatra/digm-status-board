/**
 * Returns a string representing the given Date in the format MM/DD-YYYY
 * @param date The Date object to format
 * @returns A string representing the given Date in the format MM/DD/YYYY
 */
export function get_simple_date(date: Date) {
	return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function get_days_until(date: Date) {
	const today = new Date();
	const time_diff = date.getTime() - today.getTime();
	const days_diff = Math.ceil(time_diff / (1000 * 3600 * 24));
	return days_diff;
}
