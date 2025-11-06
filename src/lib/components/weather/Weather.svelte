<script lang="ts">
	import { fetchWeatherApi } from 'openmeteo';
	import Bubbles from '$lib/components/bubbles/Bubbles.svelte';

	type WeatherData = {
		current: {
			temperature_2m: number | null;
			weather_code: number | null;
			relative_humidity_2m: number | null;
			wind_speed_10m: number | null;
			precipitation: number | null;
		};
	};

	let weather_data: WeatherData = $state({
		current: {
			temperature_2m: null,
			weather_code: null,
			relative_humidity_2m: null,
			wind_speed_10m: null,
			precipitation: null
		}
	});

	// https://open-meteo.com/en/docs?current=temperature_2m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch#weather_variable_documentation
	const weather_codes: Record<number, { status: string; icon: string }> = {
		0: { status: 'Clear sky', icon: 'ico-sunny' },
		1: { status: 'Mainly clear', icon: 'ico-sunny' },
		2: { status: 'Partly cloudy', icon: 'ico-cloud' },
		3: { status: 'Overcast', icon: 'ico-cloud' },
		45: { status: 'Foggy', icon: 'ico-cloud' },
		51: { status: 'Light drizzle', icon: 'ico-drizzle' },
		53: { status: 'Moderate drizzle', icon: 'ico-drizzle' },
		55: { status: 'Dense drizzle', icon: 'ico-drizzle' },
		56: { status: 'Light freezing drizzle', icon: 'ico-drizzle' },
		57: { status: 'Dense freezing drizzle', icon: 'ico-drizzle' },
		61: { status: 'Light rain', icon: 'ico-drizzle' },
		63: { status: 'Moderate rain', icon: 'ico-rain' },
		65: { status: 'Heavy rain', icon: 'ico-rain' },
		66: { status: 'Light freezing rain', icon: 'ico-rain' },
		67: { status: 'Heavy freezing rain', icon: 'ico-rain' },
		71: { status: 'Light snow', icon: 'ico-snow' },
		73: { status: 'Moderate snow', icon: 'ico-snow' },
		75: { status: 'Heavy snow', icon: 'ico-snow' },
		77: { status: 'Snow grains', icon: 'ico-snow' },
		80: { status: 'Rain showers', icon: 'ico-rain' },
		81: { status: 'Moderate rain showers', icon: 'ico-rain' },
		82: { status: 'Violent rain showers', icon: 'ico-rain' },
		85: { status: 'Snow showers', icon: 'ico-snow' },
		86: { status: 'Heavy snow showers', icon: 'ico-snow' },
		95: { status: 'Thunderstorm', icon: 'ico-lightning-cloud' }
	};

	async function get_weather() {
		try {
			const latitude = 39.9566168;
			const longitude = -75.192519;
			const params = {
				latitude: latitude,
				longitude: longitude,
				current: [
					'temperature_2m',
					'weather_code',
					'relative_humidity_2m',
					'wind_speed_10m',
					'precipitation'
				],
				wind_speed_unit: 'mph',
				temperature_unit: 'fahrenheit',
				precipitation_unit: 'inch'
			};
			const url = 'https://api.open-meteo.com/v1/forecast';
			const responses = await fetchWeatherApi(url, params);
			const response = responses[0];
			if (!response) throw new Error(`Failed to fetch weather data.`);

			const current = response?.current();
			return current;
		} catch (error) {
			console.error(`Error fetching weather data: ${error}`);
			throw error;
		}
	}

	async function set_weather() {
		try {
			const current = await get_weather();

			if (current) {
				weather_data = {
					current: {
						temperature_2m: Number(current?.variables(0)!.value().toFixed(1)),
						weather_code: Number(current?.variables(1)!.value().toFixed(1)),
						relative_humidity_2m: Number(current?.variables(2)!.value().toFixed(1)),
						wind_speed_10m: Number(current?.variables(3)!.value().toFixed(1)),
						precipitation: Number(current?.variables(4)!.value().toFixed(1))
					}
				};
			}
		} catch (error) {
			console.error(`Error fetching weather data: ${error}`);
			throw error;
		}
	}

	function has_weather_code(data: WeatherData): boolean {
		return typeof data?.current?.weather_code === 'number';
	}

	const refresh_interval = 600_000;

	$effect(() => {
		let interval = setInterval(set_weather, refresh_interval);
		return () => clearInterval(interval);
	});

	$effect(() => {
		set_weather();
	});
</script>

<section id="weather">
	<div class="weather">
		{#if weather_data.current}
			{#if weather_data.current.temperature_2m}
				<div class="currently">
					<p class="currently-label">Currently</p>
					<p class="temperature">{weather_data.current.temperature_2m}°F</p>
					{#if has_weather_code(weather_data)}
						<p class="conditions">
							{weather_data.current.weather_code !== null
								? (weather_codes[weather_data.current.weather_code]?.status ?? '')
								: ''}
						</p>
					{/if}
				</div>
			{/if}
			<div class="weather-details">
				{#if weather_data.current.relative_humidity_2m}
					<div class="humidity">
						<div class="icon">
							<svg><use href="#ico-fa-droplet" /></svg>
						</div>
						<p class="data-point humidity-percentage">
							{weather_data.current.relative_humidity_2m}%
						</p>
						<p class="label">Humidity</p>
					</div>
				{/if}
				{#if weather_data.current.wind_speed_10m}
					<div class="wind">
						<div class="icon">
							<svg><use href="#ico-fa-wind" /></svg>
						</div>
						<p class="data-point wind-speed">{weather_data.current.wind_speed_10m} mph</p>
						<p class="label">Wind</p>
					</div>
				{/if}
				<div class="precipitation">
					<div class="icon">
						<svg><use href="#ico-rain" /></svg>
					</div>
					<p class="data-point precipitation-total">{weather_data.current.precipitation} in</p>
					<p class="label">Precipitation</p>
				</div>
			</div>
		{/if}
	</div>
	<Bubbles parent_component="weather" />
</section>

<style>
	#weather {
		background: linear-gradient(to right, var(--color-drexel-blue-dark), var(--color-neutral-700));
		border-radius: var(--radius);
		color: var(--color-white);
		grid-area: weather;
		height: clamp(80px, 8vw, 100px);
		min-height: 154px;
		position: relative;

		.weather {
			display: grid;
			gap: calc(var(--space-small) + 4px);
			padding: var(--space-medium) var(--space-small);

			p {
				margin: 0;
			}

			.currently {
				display: flex;
				font-size: clamp(var(--font-size-small), 4cqw, 24px);
				font-weight: 500;
				gap: var(--space-small);
				justify-content: center;
				width: 100%;

				.temperature {
					font-weight: 700;
				}
			}

			.weather-details {
				display: grid;
				gap: var(--space-small);
				grid-template-columns: repeat(3, 1fr);
				margin-inline: auto;
				text-align: center;

				> div {
					display: flex;
					flex-direction: column;
					gap: calc(var(--space-small) / 2);
				}

				.data-point {
					font-size: var(--font-size);
				}

				.label {
					font-size: var(--font-size-small);
				}

				.icon {
					svg {
						color: var(--color-white);
						height: 32px;
						width: 32px;
					}
				}
			}

			@media screen and (width >= 768px) {
				.currently {
					font-size: 20px;
				}
			}

			@media screen and (width >= 1280px) {
				grid-template-columns: 120px 1fr;
				height: 100%;
				padding: var(--space-medium);

				.currently {
					flex-direction: column;
					text-align: center;

					.temperature {
						font-size: var(--font-size-large);
					}
				}

				.weather-details {
					align-content: center;
					justify-self: end;
					margin: 0;
				}
			}

			@media screen and (width >= 1920px) {
				height: auto;
				min-height: unset;
				padding: 0.75rem var(--space-medium) var(--space-small);

				.currently {
					font-size: 14px;
					text-align: left;
				}

				.weather-details {
					.data-point {
						font-size: var(--font-size-small);
					}
				}
			}
		}

		@media screen and (width >= 1920px) {
			min-height: unset;
		}
	}
</style>
