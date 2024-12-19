<script lang="ts">
	import CalendarDropdown from '$lib/components/calendar-dropdown.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import type { NearEarthObjectsResponse, OrbitalData } from '$lib/types/nasa';
	import SolarSystem from '$lib/components/solar-system/solar-system.svelte';

	let date = $state<DateValue>(today(getLocalTimeZone()));
	let nearEarthObjects = $state<NearEarthObjectsResponse | null>(null);
	let selectedOrbit = $state<OrbitalData | null>(null);

	// Function to fetch near earth objects data
	async function fetchNearEarthObjects(selectedDate: DateValue) {
		try {
			const formattedDate = selectedDate.toString();
			const response = await fetch(`/api/near-earth-objects?date=${formattedDate}`);
			const data = await response.json();
			nearEarthObjects = data;
		} catch (error) {
			console.error('Error fetching near earth objects:', error);
		}
	}

	async function fetchOrbitalData(asteroidId: string) {
		try {
			const response = await fetch(`/api/near-earth-objects/${asteroidId}/orbit`);
			const data = await response.json();
			selectedOrbit = data;
		} catch (error) {
			console.error('Error fetching orbital data:', error);
		}
	}

	$effect(() => {
		fetchNearEarthObjects(date);
	});
</script>

<header
	class="fixed top-0 z-20 flex w-screen flex-row items-center justify-between bg-black px-4 py-2"
>
	<div>
		<h1>Near earth objects</h1>
	</div>
	<div>
		<CalendarDropdown bind:value={date} />
	</div>
</header>

<main class="flex h-screen w-screen flex-row">
	{#if nearEarthObjects}
		<div class="h-screen w-1/3 overflow-y-scroll">
			<div class="mt-12 flex flex-col gap-4 p-4">
				{#each Object.entries(nearEarthObjects.near_earth_objects) as [date, objects]}
					{#each objects as object}
						<button
							class="inline-block cursor-pointer rounded-lg border p-4 hover:bg-black"
							onclick={() => fetchOrbitalData(object.id)}
						>
							<h2>{object.name}</h2>
							<p>
								Diameter: {object.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
							</p>
							<p>Hazardous: {object.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</p>
						</button>
					{/each}
				{/each}
			</div>
		</div>
		<div class="flex w-2/3 flex-col gap-4">
			<div class="h-full w-full">
				<SolarSystem {date} />
			</div>
		</div>
	{:else}
		<div class="flex h-full w-full items-center justify-center">
			<p>Loading...</p>
		</div>
	{/if}
</main>
