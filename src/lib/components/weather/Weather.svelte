<script lang="ts">
	type WeatherResponse = {
		current: {
			temperature_2m: number;
			weather_code: number | null;
			time: string;
		};

		current_units: {
			temperature_2m: string;
		};
	};

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

	let weather_data: WeatherResponse = $state({
		current: {
			temperature_2m: 0,
			weather_code: null,
			time: ''
		},
		current_units: {
			temperature_2m: ''
		}
	});

	async function get_weather() {
		try {
			const latitude = 39.9566168;
			const longitude = -75.192519;
			const response = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America/New_York`
			);

			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const data: WeatherResponse = await response.json();
			return data;
		} catch (error) {
			console.error(`Error fetching weather data: ${error}`);
			throw error;
		}
	}

	async function set_weather() {
		try {
			weather_data = await get_weather();
		} catch (error) {
			console.error(`Failed to fetch weather data: ${error}`);
		}
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
		<div class="weather-conditions">
			{#if weather_data}
				{#if weather_data.current.weather_code !== null}
					<div class="weather-conditions-icon">
						{#if weather_codes[weather_data.current.weather_code]?.icon}
							<svg>
								<use href="#{weather_codes[weather_data.current.weather_code]?.icon}" />
							</svg>
						{/if}
					</div>
					<div class="weather-conditions-details">
						<div>
							<span class="temperature"
								>{weather_data.current.temperature_2m}<sup>&deg;</sup> F</span
							>
						</div>
						<div class="conditions">{weather_codes[weather_data.current.weather_code]?.status}</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	#weather {
		background-color: var(--color-drexel-blue-light);
		border-radius: var(--radius);
		color: var(--color-drexel-blue);
		container-type: size;
		display: grid;
		grid-area: weather;
		height: clamp(80px, 8vw, 100px);

		.weather {
			.weather-conditions {
				align-items: center;
				column-gap: var(--space-neutral);
				display: flex;
				height: 100%;
				justify-content: center;

				.weather-conditions-icon {
					align-items: center;
					color: var(--color-drexel-blue);
					display: flex;
					height: 100%;
					justify-content: end;

					svg {
						height: 48px;
						width: 48px;
					}
				}

				.weather-conditions-details {
					> div:first-of-type {
						align-items: baseline;
						column-gap: var(--space-medium);
						display: flex;
					}

					.temperature {
						font-size: 40cqh;
						font-weight: 800;
						letter-spacing: var(--letter-spacing-tight);
					}

					.conditions {
						font-size: clamp(var(--font-size-small), 4cqw, var(--font-size-medium));
						font-weight: 600;
						letter-spacing: var(--letter-spacing);
					}
				}
			}
		}
	}
</style>
