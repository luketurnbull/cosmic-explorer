<script lang="ts">
	import { T } from '@threlte/core';
	import type { DateValue } from '@internationalized/date';
	import { PlanetCalculator } from '$lib/utils/planet-calculator';
	import { PLANET_DETAILS } from '$lib/utils/planets';

	let { date } = $props<{ date: DateValue }>();
	let planetData = $derived(PlanetCalculator.calculateSolarSystem(date.toDate('UTC')));

	// Increase scale to see outer planets
	const SCALE = 4;

	$effect(() => {
		// Debug log to check positions
		planetData.forEach((planet) => {
			console.log(`${planet.name} position:`, {
				x: planet.position.x * SCALE,
				y: planet.position.y * SCALE,
				z: planet.position.z * SCALE,
				distance: planet.distanceFromSun
			});
		});
	});
</script>

{#each planetData as planet}
	<T.Mesh
		position={[planet.position.x * SCALE, planet.position.y * SCALE, planet.position.z * SCALE]}
	>
		<T.SphereGeometry args={[0.3]} />
		<T.MeshStandardMaterial color={PLANET_DETAILS[planet.name].color} />
	</T.Mesh>

	{#if planet.orbitPoints}
		<!-- Complete orbit line -->
		<T.Line>
			<T.BufferGeometry>
				<T.Float32BufferAttribute
					attach="attributes-position"
					args={[
						new Float32Array(
							planet.orbitPoints.flatMap((p) => [p.x * SCALE, p.y * SCALE, p.z * SCALE])
						),
						3
					]}
				/>
			</T.BufferGeometry>
			<T.LineBasicMaterial color={PLANET_DETAILS[planet.name].color} />
		</T.Line>

		<!-- Debug points -->
		{#each planet.orbitPoints as point, i}
			<!-- Only show every 10th point to avoid clutter -->
			<T.Mesh position={[point.x * SCALE, point.y * SCALE, point.z * SCALE]}>
				<T.SphereGeometry args={[0.05]} />
				<T.MeshBasicMaterial color={PLANET_DETAILS[planet.name].color} />
			</T.Mesh>
		{/each}
	{/if}
{/each}

<!-- Debug axes -->
<T.AxesHelper args={[10]} />
