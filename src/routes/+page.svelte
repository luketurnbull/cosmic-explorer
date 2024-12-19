<script lang="ts">
	import CalendarDropdown from '$lib/components/calendar-dropdown.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import type { NearEarthObjectsResponse, OrbitalData } from '$lib/types/nasa';

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

<header class="fixed top-0 flex w-screen flex-row items-center justify-between bg-black px-4 py-2">
	<div>
		<h1>Near earth objects</h1>
	</div>
	<div>
		<CalendarDropdown bind:value={date} />
	</div>
</header>

<main class="mt-16 flex h-screen w-screen">
	{#if nearEarthObjects}
		<div class="grid w-1/2 grid-cols-2 gap-4 p-4">
			<div class="flex flex-col gap-4">
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
			<div class="flex flex-col gap-4">
				{#if selectedOrbit}
					<div class="rounded-lg border p-4">
						<h2>Orbital Data</h2>
						<p>Orbital Period: {selectedOrbit.orbital_period} days</p>
						<p>Eccentricity: {selectedOrbit.eccentricity}</p>
						<p>Inclination: {selectedOrbit.inclination}°</p>
						<p>Orbit Class: {selectedOrbit.orbit_class.orbit_class_type}</p>
						<p>Description: {selectedOrbit.orbit_class.orbit_class_description}</p>
					</div>
				{:else}
					<p>Select an asteroid to view orbital data</p>
				{/if}
			</div>
		</div>
	{:else}
		<p>Loading...</p>
	{/if}
</main>
