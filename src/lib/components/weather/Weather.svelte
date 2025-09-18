<script lang="ts">
	import { fetchWeatherApi } from 'openmeteo';
	import Bubbles from '$lib/components/bubbles/Bubbles.svelte';

	type WeatherData = {
		current: {
			temperature_2m: number | null;
			weather_code: number | null;
			relative_humidity_2m: number | null;
			wind_speed_10m: number | null;
		};
	};

	let weather_data: WeatherData = $state({
		current: {
			temperature_2m: null,
			weather_code: null,
			relative_humidity_2m: null,
			wind_speed_10m: null
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
				current: ['temperature_2m', 'weather_code', 'relative_humidity_2m', 'wind_speed_10m'],
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
						wind_speed_10m: Number(current?.variables(3)!.value().toFixed(1))
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
					<p>Currently Outside</p>
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
			</div>
		{/if}
	</div>
	<Bubbles parent_component="weather" />
</section>

<style>
	#weather {
		background: linear-gradient(
			to right,
			var(--color-drexel-blue-dark),
			var(--color-drexel-green-light)
		);
		border-radius: var(--radius);
		color: var(--color-white);
		grid-area: weather;
		height: clamp(80px, 8vw, 100px);
		min-height: 154px;
		position: relative;

		.weather {
			align-items: center;
			display: grid;
			grid-template-columns: 2fr 1fr;
			height: 100%;
			padding: var(--space-medium);
			width: 100%;

			> * p {
				font-size: var(--font-size);
				line-height: 1;
				margin: 0;
			}

			p.label {
				font-size: var(--font-size-xx-small);
			}

			p.data-point {
				font-size: var(--font-size);
				font-weight: 600;
			}

			.currently {
				display: grid;
				row-gap: var(--space-small);

				.temperature {
					font-size: calc(var(--font-size-xx-large) + 0.5em);
					font-weight: 500;
				}
			}

			.weather-details {
				display: grid;
				justify-self: end;
				row-gap: var(--space-medium);
				width: 100%;

				& > div {
					display: grid;
					row-gap: calc(var(--space-small) / 2);
					text-align: center;
				}

				.humidity {
					display: none;
				}

				.icon {
					display: grid;
					height: 24px;
					place-items: center;
					width: 100%;

					svg {
						height: 100%;
						width: 100%;
					}
				}
			}

			@media screen and (width >= 460px) {
				grid-template-columns: 2fr 1.5fr;
				padding-inline: var(--space-large);

				.weather-details {
					max-width: 90px;
				}
			}

			@media screen and (width >= 500px) {
				.weather-details {
					grid-template-columns: repeat(2, 1fr);
					max-width: 200px;

					.humidity {
						display: grid;
					}
				}
			}

			@media screen and (width >= 570px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media screen and (width >= 768px) {
				padding-inline: var(--space-large) calc(var(--space-small) + 0.25em);

				> * p {
					font-size: calc(var(--font-size-small) + 0.25em);
				}

				p.data-point {
					font-size: calc(var(--font-size) - 0.25em);
				}
			}

			@media screen and (width >= 1340px) {
				grid-template-columns: 2fr 1fr;
				padding-inline: var(--space-large);

				> * p {
					font-size: var(--font-size-small);
				}

				p.label {
					font-size: var(--font-size-xx-small);
				}

				p.data-point {
					font-size: calc(var(--font-size-small) + 0.75em);
				}

				.weather-details {
					width: 345px;
				}
			}
		}

		@media screen and (width >= 1920px) {
			min-height: unset;

			.weather {
				padding: var(--space-small) var(--space-medium);

				> * p {
					font-size: var(--font-size-small);
				}

				p.label {
					font-size: var(--font-size-xxxx-small);
				}

				p.data-point {
					font-size: var(--font-size-x-small);
				}

				.weather-details {
					max-width: unset;
					min-width: unset;
					width: auto;
				}

				.currently {
					row-gap: calc(var(--space-small) / 2);

					.temperature {
						font-size: var(--font-size-x-large);
					}
				}
			}
		}
	}
</style>
