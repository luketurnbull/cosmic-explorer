<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import type { DateValue } from '@internationalized/date';
	import { PLANET_DETAILS, type Planet } from '$lib/utils/planets';
	import * as THREE from 'three';

	let { date } = $props<{ date: DateValue }>();
	let planetPositions = $state<Record<Planet, { position: { x: number; y: number; z: number } }>>(
		{} as any
	);

	// Scale factor to make the visualization manageable
	const AU_TO_SCENE_UNITS = 10;

	// Create orbit paths
	function createOrbitPath(radius: number) {
		const points = [];
		const segments = 128;
		for (let i = 0; i <= segments; i++) {
			const theta = (i / segments) * Math.PI * 2;
			points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
		}
		return new THREE.BufferGeometry().setFromPoints(points);
	}

	// Calculate orbit radius for each planet based on its position
	function getOrbitRadius(position: { x: number; y: number; z: number }) {
		return Math.sqrt(position.x * position.x + position.z * position.z);
	}

	async function fetchPlanetPositions(selectedDate: DateValue) {
		try {
			const response = await fetch(`/api/planets/positions?date=${selectedDate.toString()}`);
			const data = await response.json();

			// Transform the data into a more usable format
			const positions: typeof planetPositions = {};
			data.forEach((planetData: any) => {
				positions[planetData.planet] = {
					position: planetData.orbitalData[0].position
				};
			});

			planetPositions = positions;
		} catch (error) {
			console.error('Error fetching planet positions:', error);
		}
	}

	$effect(() => {
		fetchPlanetPositions(date);
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 30, 30]} fov={45}>
	<OrbitControls enableZoom target={[0, 0, 0]} />
</T.PerspectiveCamera>

<!-- Ambient Light -->
<T.AmbientLight intensity={0.2} />

<!-- Sun -->
<T.PointLight position={[0, 0, 0]} intensity={1.5} />
<T.Mesh position={[0, 0, 0]}>
	<T.SphereGeometry args={[0.01, 32, 32]} />
	<T.MeshBasicMaterial color="#FDB813" />
</T.Mesh>

<!-- Planets and their orbits -->
{#each Object.entries(PLANET_DETAILS) as [planetName, details]}
	{#if planetPositions[planetName as Planet]}
		{@const pos = planetPositions[planetName as Planet].position}
		{@const orbitRadius = getOrbitRadius(pos)}

		<!-- Orbit Path -->
		<T.Mesh rotation.x={-Math.PI / 2}>
			<T.RingGeometry args={[orbitRadius * 10 - 0.01, orbitRadius * 10, 64]} />
			<T.MeshBasicMaterial color={details.color} side={THREE.DoubleSide} />
		</T.Mesh>

		<!-- Planet -->
		<T.Mesh
			position={[pos.x * AU_TO_SCENE_UNITS, 0, pos.z * AU_TO_SCENE_UNITS]}
			scale={details.size * 0.1}
		>
			<T.SphereGeometry args={[0.5, 32, 32]} />
			<T.MeshStandardMaterial color={details.color} />
		</T.Mesh>
	{/if}
{/each}
