<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { DateValue } from '@internationalized/date';
	import { SolarSystem } from '$lib/three/solar-system';

	let { date } = $props<{ date: DateValue }>();
	let container: HTMLDivElement;
	let solarSystem: SolarSystem;

	onMount(() => {
		solarSystem = new SolarSystem(container);
		solarSystem.updatePlanets(date);
	});

	$effect(() => {
		if (solarSystem) {
			solarSystem.updatePlanets(date);
		}
	});

	onDestroy(() => {
		if (solarSystem) {
			solarSystem.dispose();
		}
	});
</script>

<div bind:this={container} class="h-full w-full"></div>
