<script lang="ts">
	import CalendarDropdown from '$lib/components/calendar-dropdown.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import type { NearEarthObjectsResponse } from '$lib/types/nasa';

	let date = $state<DateValue>(today(getLocalTimeZone()));
	let nearEarthObjects = $state<NearEarthObjectsResponse | null>(null);

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
		<pre>{JSON.stringify(nearEarthObjects, null, 2)}</pre>
	{:else}
		<p>Loading...</p>
	{/if}
</main>
